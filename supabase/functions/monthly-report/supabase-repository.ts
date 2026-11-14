/**
 * ReportRepository의 Supabase 구현. 서버 함수에서 service role 클라이언트로 호출한다. (RLS 우회)
 */
import type { GradingStatus, ReportPeriod, ReportRow } from "./report.ts";
import type { Academy, ReportLog, ReportRepository } from "./run.ts";
import { MAIL_BATCH_KEYS, parseMailBatchSettings, type MailBatchSettings } from "./schedule.ts";

/** supabase-js 클라이언트 (Deno의 npm: 타입과 Node 타입을 섞지 않도록 느슨하게 받는다) */
// deno-lint-ignore no-explicit-any
type SupabaseLike = any;

/** supabase 쿼리 응답 */
type QueryResult = { data: unknown; error: { message: string } | null };

type AcademyRow = { id: string; name: string; image_retention_months: number };
type JobRow = {
  created_at: string;
  status: GradingStatus;
  score: number | string | null;
  student: { name: string; class: { name: string } | null } | null;
  sheet: { title: string; type: "subjective" | "objective" } | null;
  items:
    | {
        question_no: number;
        is_correct: boolean | null;
        reviewed_is_correct: boolean | null;
        needs_review: boolean;
      }[]
    | null;
};

/**
 * 조회 결과의 오류를 확인하고 데이터를 지정한 행 타입으로 돌려준다.
 * @template T 행 타입
 * @param {QueryResult} result - supabase 응답
 * @param {string} action - 작업 이름 (오류 메시지용)
 * @returns {T[]} 행 목록 (없으면 빈 배열)
 */
function unwrapRows<T>(result: QueryResult, action: string): T[] {
  if (result.error) throw new Error(`${action} 실패: ${result.error.message}`);
  return (result.data as T[] | null) ?? [];
}

/**
 * 쓰기 결과의 오류를 확인한다.
 * @param {QueryResult} result - supabase 응답
 * @param {string} action - 작업 이름 (오류 메시지용)
 * @returns {void}
 */
function assertOk(result: QueryResult, action: string) {
  if (result.error) throw new Error(`${action} 실패: ${result.error.message}`);
}

/**
 * 시스템 설정(system_settings)에서 메일 배치 설정(사용 여부·주기)을 읽는다.
 * @param {SupabaseLike} client - service role 키로 만든 supabase-js 클라이언트
 * @returns {Promise<MailBatchSettings>}
 */
export async function readMailBatchSettings(client: SupabaseLike): Promise<MailBatchSettings> {
  const rows = unwrapRows<{ prop_key: string; prop_val: string | null }>(
    await client
      .from("system_settings")
      .select("prop_key, prop_val")
      .in("prop_key", [MAIL_BATCH_KEYS.enabled, MAIL_BATCH_KEYS.cycle]),
    "메일 배치 설정 조회",
  );
  return parseMailBatchSettings(rows);
}

/**
 * Supabase 기반 보고서 저장소를 만든다.
 * @param {SupabaseLike} client - service role 키로 만든 supabase-js 클라이언트
 * @returns {ReportRepository}
 */
export function createSupabaseRepository(
  client: SupabaseLike,
): ReportRepository {
  return {
    async listAcademies(): Promise<Academy[]> {
      const rows = unwrapRows<AcademyRow>(
        await client
          .from("academies")
          .select("id, name, image_retention_months"),
        "학원 조회",
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        imageRetentionMonths: row.image_retention_months,
      }));
    },

    async hasSentReport(academyId: string, period: ReportPeriod) {
      const rows = unwrapRows<{ id: string }>(
        await client
          .from("report_logs")
          .select("id")
          .eq("academy_id", academyId)
          .eq("period_start", period.start)
          .eq("period_end", period.end)
          .eq("status", "sent")
          .limit(1),
        "발송 기록 조회",
      );
      return rows.length > 0;
    },

    async listReportRows(
      academyId: string,
      from: string,
      to: string,
    ): Promise<ReportRow[]> {
      const rows = unwrapRows<JobRow>(
        await client
          .from("grading_jobs")
          .select(
            `created_at, status, score,
             student:students(name, class:classes(name)),
             sheet:answer_sheets(title, type),
             items:grading_items(question_no, is_correct, reviewed_is_correct, needs_review)`,
          )
          .eq("academy_id", academyId)
          .gte("created_at", from)
          .lt("created_at", to)
          .order("created_at"),
        "채점 작업 조회",
      );
      return rows.map((row) => ({
        createdAt: row.created_at,
        studentName: row.student?.name ?? "",
        className: row.student?.class?.name ?? "",
        sheetTitle: row.sheet?.title ?? "",
        sheetType: row.sheet?.type ?? "subjective",
        status: row.status,
        // numeric 컬럼은 문자열로 올 수 있다.
        score: row.score === null ? null : Number(row.score),
        items: (row.items ?? []).map((item) => ({
          questionNo: item.question_no,
          isCorrect: item.is_correct,
          reviewedIsCorrect: item.reviewed_is_correct,
          needsReview: item.needs_review,
        })),
      }));
    },

    async listTeacherEmails(academyId: string) {
      const teachers = unwrapRows<{ id: string }>(
        await client
          .from("profiles")
          .select("id")
          .eq("academy_id", academyId)
          .eq("role", "teacher"),
        "선생님 조회",
      );
      const emails: string[] = [];
      for (const teacher of teachers) {
        const { data, error } = await client.auth.admin.getUserById(teacher.id);
        if (error) throw new Error(`선생님 계정 조회 실패: ${error.message}`);
        if (data.user?.email) emails.push(data.user.email);
      }
      return emails;
    },

    async listExpiredImages(academyId: string, cutoff: string) {
      const rows = unwrapRows<{ id: string; image_path: string }>(
        await client
          .from("grading_jobs")
          .select("id, image_path")
          .eq("academy_id", academyId)
          .lt("created_at", cutoff)
          .not("image_path", "is", null),
        "보관 기간 경과 사진 조회",
      );
      return rows.map((row) => ({ jobId: row.id, imagePath: row.image_path }));
    },

    async markImagesPurged(jobIds: string[]) {
      assertOk(
        await client
          .from("grading_jobs")
          .update({
            image_path: null,
            image_purged_at: new Date().toISOString(),
          })
          .in("id", jobIds),
        "사진 정리 기록",
      );
    },

    async saveLog(log: ReportLog) {
      assertOk(
        await client.from("report_logs").insert({
          academy_id: log.academyId,
          period_start: log.period.start,
          period_end: log.period.end,
          status: log.status,
          recipient_count: log.recipientCount,
          job_count: log.jobCount,
          purged_image_count: log.purgedImageCount,
          error: log.error,
        }),
        "발송 기록 저장",
      );
    },
  };
}
