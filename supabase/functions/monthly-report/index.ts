/**
 * 채점 결과 메일 배치 서버 함수 (Supabase Edge Function, Deno).
 *
 * 호출
 *   - 예약 실행: pg_cron이 매일 { "trigger": "cron" } 으로 POST (…_monthly_report_cron.sql)
 *       시스템 설정(관리자 화면 "시스템 설정")을 읽어 실행 여부·기간을 정한다.
 *         WM.MAIL_BATCH.ENABLED = false → 건너뜀
 *         WM.MAIL_BATCH.CYCLE           → DAILY(매일, 어제분) / WEEKLY(월요일, 지난주분) / MONTHLY(1일, 지난달분)
 *   - 수동 실행: { "period": "2026-10" | "2026-11-13", "dryRun": true }
 *       사용 여부 설정과 무관하게 실행한다. period를 생략하면 설정된 주기의 직전 기간.
 *       dryRun: 발송·사진 정리·기록 없이 대상만 확인
 *   - 공통: 헤더 x-cron-secret 이 CRON_SECRET 비밀값과 같아야 한다.
 *
 * 필요한 비밀값 (npx supabase secrets set …):
 *   CRON_SECRET, RESEND_API_KEY, REPORT_FROM_EMAIL
 *   PAPER_BUCKET (선택) — 원본 사진 Storage 버킷. 없으면 사진 정리를 건너뛴다.
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 는 Supabase가 자동 제공
 *
 * 자세한 설정: docs/MONTHLY_REPORT.md
 */
import { createClient } from "@supabase/supabase-js";
import { createResendMailer } from "./mailer.ts";
import { getPreviousPeriod, parsePeriod, type ReportPeriod } from "./report.ts";
import { runMonthlyReport, type ImageStorage, type Mailer } from "./run.ts";
import { decideScheduledRun } from "./schedule.ts";
import { createSupabaseRepository, readMailBatchSettings } from "./supabase-repository.ts";

/**
 * JSON 응답을 만든다.
 * @param {number} status - HTTP 상태 코드
 * @param {unknown} body - 응답 본문
 * @returns {Response}
 */
function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 비밀값을 읽는다. 없으면 오류.
 * @param {string} name - 비밀값 이름
 * @returns {string}
 */
function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`비밀값 ${name}이(가) 설정되지 않았습니다.`);
  return value;
}

/**
 * 오류를 메시지 문자열로 바꾼다.
 * @param {unknown} error - 오류
 * @returns {string}
 */
function messageOf(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : JSON.stringify(error);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json(405, { error: "POST만 허용합니다." });

  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return json(401, { error: "인증되지 않은 요청입니다." });
  }

  const body = (await request.json().catch(() => ({}))) as {
    trigger?: string;
    period?: string;
    dryRun?: boolean;
  };
  const isScheduled = body.trigger === "cron";
  const dryRun = body.dryRun === true;

  // 요청 값 오류는 400으로 구분한다.
  let requestedPeriod: ReportPeriod | null = null;
  try {
    requestedPeriod = body.period ? parsePeriod(body.period) : null;
  } catch (error) {
    return json(400, { error: messageOf(error) });
  }

  try {
    const client = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const now = new Date();
    const settings = await readMailBatchSettings(client);

    let period: ReportPeriod;
    if (isScheduled) {
      const decision = decideScheduledRun(settings, now);
      if (!decision.run) return json(200, { skipped: decision.reason, settings });
      period = decision.period;
    } else {
      period = requestedPeriod ?? getPreviousPeriod(now, settings.cycle);
    }

    // dryRun은 메일을 보내지 않으므로 메일 비밀값이 없어도 실행할 수 있다.
    const mailer: Mailer = dryRun
      ? { send: () => Promise.resolve() }
      : createResendMailer({
          apiKey: requireEnv("RESEND_API_KEY"),
          from: requireEnv("REPORT_FROM_EMAIL"),
        });

    const bucket = Deno.env.get("PAPER_BUCKET");
    const storage: ImageStorage | null = bucket
      ? {
          async remove(paths) {
            const { error } = await client.storage.from(bucket).remove(paths);
            if (error) throw new Error(`사진 삭제 실패: ${error.message}`);
          },
        }
      : null;

    const results = await runMonthlyReport(
      { repository: createSupabaseRepository(client), mailer, storage },
      { period, now, dryRun },
    );
    const failed = results.filter((result) => result.status === "failed").length;
    return json(failed > 0 ? 207 : 200, {
      trigger: isScheduled ? "cron" : "manual",
      settings,
      period,
      dryRun,
      storageConfigured: Boolean(bucket),
      results,
    });
  } catch (error) {
    return json(500, { error: messageOf(error) });
  }
});
