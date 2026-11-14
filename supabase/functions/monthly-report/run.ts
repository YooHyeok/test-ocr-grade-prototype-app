/**
 * 월간 보고서 실행 흐름. DB·메일·저장소는 인터페이스로 주입받아 테스트에서 가짜로 바꿀 수 있다. (run.test.ts)
 *
 * 학원별 처리 순서:
 *   1. 이미 이번 기간 보고서를 보냈으면 건너뜀 (중복 발송 방지)
 *   2. 받는 사람(선생님) 이메일이 없으면 건너뜀 → 사진 정리도 하지 않음
 *   3. 지난달 채점 작업이 있으면 요약 + CSV 메일 발송 (없으면 발송 생략)
 *   4. 발송 성공(또는 보낼 내용 없음) 후 보관 기간이 지난 원본 사진 정리
 *   5. 결과를 report_logs에 기록 — 한 학원이 실패해도 다른 학원은 계속 처리
 */
import {
  buildCsv,
  buildEmail,
  periodToUtcRange,
  retentionCutoff,
  summarize,
  toBase64,
  type ReportPeriod,
  type ReportRow,
} from "./report.ts";

export type Academy = {
  id: string;
  name: string;
  imageRetentionMonths: number;
};

export type ReportLog = {
  academyId: string;
  period: ReportPeriod;
  status: "sent" | "skipped" | "failed";
  recipientCount: number;
  jobCount: number;
  purgedImageCount: number;
  error: string | null;
};

/** 보고서에 필요한 DB 접근 */
export interface ReportRepository {
  listAcademies(): Promise<Academy[]>;
  hasSentReport(academyId: string, period: ReportPeriod): Promise<boolean>;
  /** [from, to) 사이에 올라온 채점 작업 */
  listReportRows(
    academyId: string,
    from: string,
    to: string,
  ): Promise<ReportRow[]>;
  listTeacherEmails(academyId: string): Promise<string[]>;
  /** cutoff 이전에 올라왔고 원본 사진이 남아 있는 채점 작업 */
  listExpiredImages(
    academyId: string,
    cutoff: string,
  ): Promise<{ jobId: string; imagePath: string }[]>;
  markImagesPurged(jobIds: string[]): Promise<void>;
  saveLog(log: ReportLog): Promise<void>;
}

export type MailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  attachments: { filename: string; content: string }[];
};

/** 메일 발송 */
export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/** 원본 사진 저장소 (미정이면 null → 사진 정리를 건너뜀) */
export interface ImageStorage {
  remove(paths: string[]): Promise<void>;
}

export type RunDependencies = {
  repository: ReportRepository;
  mailer: Mailer;
  storage: ImageStorage | null;
};

export type RunOptions = {
  period: ReportPeriod;
  now: Date;
  /** true면 발송·정리·기록 없이 결과만 계산 */
  dryRun?: boolean;
};

export type AcademyResult = {
  academyId: string;
  academyName: string;
  status: "sent" | "skipped" | "failed";
  reason?: "already_sent" | "no_recipients" | "no_jobs" | "dry_run";
  recipientCount: number;
  jobCount: number;
  purgedImageCount: number;
  error?: string;
};

/**
 * 보관 기간이 지난 원본 사진을 정리한다. 저장소가 없으면 아무것도 하지 않는다.
 * 저장소 파일을 먼저 지운 뒤 DB 경로를 비운다. (파일 삭제 실패 시 DB는 그대로)
 * @param {RunDependencies} deps - 의존성
 * @param {Academy} academy - 학원
 * @param {Date} now - 실행 시각
 * @returns {Promise<number>} 정리한 사진 수
 */
async function purgeExpiredImages(
  deps: RunDependencies,
  academy: Academy,
  now: Date,
) {
  if (!deps.storage) return 0;
  const cutoff = retentionCutoff(
    now,
    academy.imageRetentionMonths,
  ).toISOString();
  const expired = await deps.repository.listExpiredImages(academy.id, cutoff);
  if (expired.length === 0) return 0;
  await deps.storage.remove(expired.map((item) => item.imagePath));
  await deps.repository.markImagesPurged(expired.map((item) => item.jobId));
  return expired.length;
}

/**
 * 학원 하나의 월간 보고서를 처리한다.
 * @param {RunDependencies} deps - 의존성
 * @param {Academy} academy - 학원
 * @param {RunOptions} options - 실행 옵션
 * @returns {Promise<AcademyResult>}
 */
async function processAcademy(
  deps: RunDependencies,
  academy: Academy,
  options: RunOptions,
): Promise<AcademyResult> {
  const { period, now, dryRun = false } = options;
  const base = {
    academyId: academy.id,
    academyName: academy.name,
    recipientCount: 0,
    jobCount: 0,
    purgedImageCount: 0,
  };

  if (await deps.repository.hasSentReport(academy.id, period)) {
    return { ...base, status: "skipped", reason: "already_sent" };
  }

  const recipients = await deps.repository.listTeacherEmails(academy.id);
  const { from, to } = periodToUtcRange(period);
  const rows = await deps.repository.listReportRows(academy.id, from, to);
  const counts = {
    ...base,
    recipientCount: recipients.length,
    jobCount: rows.length,
  };

  if (dryRun) return { ...counts, status: "skipped", reason: "dry_run" };

  if (recipients.length === 0) {
    await deps.repository.saveLog({
      academyId: academy.id,
      period,
      status: "skipped",
      recipientCount: 0,
      jobCount: rows.length,
      purgedImageCount: 0,
      error: "받는 사람(선생님 계정)이 없습니다.",
    });
    return { ...counts, status: "skipped", reason: "no_recipients" };
  }

  if (rows.length > 0) {
    const email = buildEmail({
      academyName: academy.name,
      period,
      summary: summarize(rows),
      retentionMonths: academy.imageRetentionMonths,
    });
    await deps.mailer.send({
      to: recipients,
      ...email,
      attachments: [
        {
          filename: `grading-report-${period.label}.csv`,
          content: toBase64(buildCsv(rows)),
        },
      ],
    });
  }

  const purgedImageCount = await purgeExpiredImages(deps, academy, now);
  const status = rows.length > 0 ? "sent" : "skipped";
  await deps.repository.saveLog({
    academyId: academy.id,
    period,
    status,
    recipientCount: recipients.length,
    jobCount: rows.length,
    purgedImageCount,
    error: null,
  });
  return {
    ...counts,
    status,
    ...(rows.length === 0 ? { reason: "no_jobs" as const } : {}),
    purgedImageCount,
  };
}

/**
 * 모든 학원의 월간 보고서를 처리한다.
 * @param {RunDependencies} deps - DB·메일·저장소
 * @param {RunOptions} options - 기간·실행 시각·dryRun
 * @returns {Promise<AcademyResult[]>} 학원별 결과
 */
export async function runMonthlyReport(
  deps: RunDependencies,
  options: RunOptions,
): Promise<AcademyResult[]> {
  const academies = await deps.repository.listAcademies();
  const results: AcademyResult[] = [];

  for (const academy of academies) {
    try {
      results.push(await processAcademy(deps, academy, options));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        academyId: academy.id,
        academyName: academy.name,
        status: "failed",
        recipientCount: 0,
        jobCount: 0,
        purgedImageCount: 0,
        error: message,
      });
      if (!options.dryRun) {
        await deps.repository
          .saveLog({
            academyId: academy.id,
            period: options.period,
            status: "failed",
            recipientCount: 0,
            jobCount: 0,
            purgedImageCount: 0,
            error: message,
          })
          .catch(() => {
            // 기록 저장까지 실패해도 다음 학원 처리는 계속한다.
          });
      }
    }
  }
  return results;
}
