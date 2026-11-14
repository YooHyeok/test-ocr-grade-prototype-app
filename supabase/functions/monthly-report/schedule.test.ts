import { describe, expect, it } from "vitest";
import {
  decideScheduledRun,
  MAIL_BATCH_KEYS,
  parseMailBatchSettings,
} from "./schedule.ts";

describe("메일 배치 설정 해석", () => {
  it("system_settings 행에서 사용 여부와 주기를 읽는다", () => {
    expect(
      parseMailBatchSettings([
        { prop_key: MAIL_BATCH_KEYS.enabled, prop_val: "true" },
        { prop_key: MAIL_BATCH_KEYS.cycle, prop_val: "WEEKLY" },
      ]),
    ).toEqual({ enabled: true, cycle: "WEEKLY" });
  });

  it("값이 없거나 잘못됐으면 사용 안 함·매월로 본다", () => {
    expect(parseMailBatchSettings([])).toEqual({
      enabled: false,
      cycle: "MONTHLY",
    });
    expect(
      parseMailBatchSettings([
        { prop_key: MAIL_BATCH_KEYS.enabled, prop_val: "Y" },
        { prop_key: MAIL_BATCH_KEYS.cycle, prop_val: "YEARLY" },
      ]),
    ).toEqual({ enabled: false, cycle: "MONTHLY" });
  });
});

describe("예약 실행 판단", () => {
  const firstDayKst = new Date("2026-11-01T00:05:00Z"); // 2026-11-01(일) 09:05 KST
  const mondayKst = new Date("2026-11-02T00:05:00Z"); // 2026-11-02(월) 09:05 KST

  it("사용 안 함이면 주기와 관계없이 건너뛴다", () => {
    expect(
      decideScheduledRun({ enabled: false, cycle: "DAILY" }, firstDayKst),
    ).toEqual({
      run: false,
      reason: "disabled",
    });
  });

  it("발송하는 날이 아니면 건너뛴다", () => {
    expect(
      decideScheduledRun({ enabled: true, cycle: "MONTHLY" }, mondayKst),
    ).toEqual({
      run: false,
      reason: "not_scheduled",
    });
    expect(
      decideScheduledRun({ enabled: true, cycle: "WEEKLY" }, firstDayKst),
    ).toEqual({
      run: false,
      reason: "not_scheduled",
    });
  });

  it("발송하는 날이면 주기에 맞는 직전 기간을 돌려준다", () => {
    expect(
      decideScheduledRun({ enabled: true, cycle: "MONTHLY" }, firstDayKst),
    ).toMatchObject({
      run: true,
      period: { start: "2026-10-01", end: "2026-11-01" },
    });
    expect(
      decideScheduledRun({ enabled: true, cycle: "WEEKLY" }, mondayKst),
    ).toMatchObject({
      run: true,
      period: { start: "2026-10-26", end: "2026-11-02" },
    });
    expect(
      decideScheduledRun({ enabled: true, cycle: "DAILY" }, mondayKst),
    ).toMatchObject({
      run: true,
      period: { start: "2026-11-01", end: "2026-11-02" },
    });
  });
});
