/**
 * 메일 배치 실행 여부 판단 (시스템 설정 WM.MAIL_BATCH.* 기준). 순수 로직이라 Vitest로 테스트한다. (schedule.test.ts)
 *
 * pg_cron은 매일 같은 시각에 호출하고, 실제 발송 여부는 여기서 결정한다.
 * 그래서 관리자가 화면에서 주기를 바꿔도 예약 실행을 다시 등록할 필요가 없다.
 */
import {
  getPreviousPeriod,
  isScheduledDay,
  type ReportCycle,
  type ReportPeriod,
} from "./report.ts";

/** 시스템 설정 키 (supabase/migrations/…_system_settings.sql) */
export const MAIL_BATCH_KEYS = {
  enabled: "WM.MAIL_BATCH.ENABLED",
  cycle: "WM.MAIL_BATCH.CYCLE",
} as const;

export type MailBatchSettings = {
  enabled: boolean;
  cycle: ReportCycle;
};

const CYCLES = new Set<string>(["DAILY", "WEEKLY", "MONTHLY"]);

/**
 * system_settings 행 목록에서 메일 배치 설정을 읽는다.
 * 값이 없거나 잘못됐으면 안전한 기본값(사용 안 함, 매월)을 쓴다.
 * @param {{ prop_key: string, prop_val: string | null }[]} rows - 설정 행
 * @returns {MailBatchSettings}
 */
export function parseMailBatchSettings(
  rows: { prop_key: string; prop_val: string | null }[],
): MailBatchSettings {
  const value = (key: string) =>
    rows.find((row) => row.prop_key === key)?.prop_val ?? null;
  const cycle = value(MAIL_BATCH_KEYS.cycle);
  return {
    enabled: value(MAIL_BATCH_KEYS.enabled) === "true",
    cycle: cycle && CYCLES.has(cycle) ? (cycle as ReportCycle) : "MONTHLY",
  };
}

export type ScheduleDecision =
  | { run: true; period: ReportPeriod }
  | { run: false; reason: "disabled" | "not_scheduled" };

/**
 * 예약 실행 시각에 발송할지, 한다면 어떤 기간을 보낼지 결정한다.
 * @param {MailBatchSettings} settings - 메일 배치 설정
 * @param {Date} now - 실행 시각
 * @returns {ScheduleDecision}
 */
export function decideScheduledRun(
  settings: MailBatchSettings,
  now: Date,
): ScheduleDecision {
  if (!settings.enabled) return { run: false, reason: "disabled" };
  if (!isScheduledDay(now, settings.cycle))
    return { run: false, reason: "not_scheduled" };
  return { run: true, period: getPreviousPeriod(now, settings.cycle) };
}
