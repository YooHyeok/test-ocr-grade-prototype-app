import { describe, expect, it, vi } from "vitest";
import { parsePeriod, type ReportRow } from "./report.ts";
import {
  runMonthlyReport,
  type Academy,
  type ReportLog,
  type ReportRepository,
} from "./run.ts";

const PERIOD = parsePeriod("2026-10");
const NOW = new Date("2026-11-01T00:05:00Z");

const ROW: ReportRow = {
  createdAt: "2026-10-05T01:30:00.000Z",
  studentName: "김학생",
  className: "고2 화학 I",
  sheetTitle: "산화 환원",
  sheetType: "subjective",
  status: "completed",
  score: 90,
  items: [],
};

type Fixture = {
  academies?: Academy[];
  sent?: string[];
  rows?: Record<string, ReportRow[]>;
  emails?: Record<string, string[]>;
  expired?: Record<string, { jobId: string; imagePath: string }[]>;
  failOn?: string;
};

/**
 * 메모리 기반 가짜 저장소를 만든다.
 * @param {Fixture} fixture - 학원별 데이터
 * @returns {{ repository: ReportRepository, logs: ReportLog[], purged: string[] }}
 */
function makeRepository(fixture: Fixture) {
  const logs: ReportLog[] = [];
  const purged: string[] = [];
  const repository: ReportRepository = {
    listAcademies: () =>
      Promise.resolve(
        fixture.academies ?? [
          { id: "a1", name: "라온", imageRetentionMonths: 3 },
        ],
      ),
    hasSentReport: (academyId) =>
      Promise.resolve((fixture.sent ?? []).includes(academyId)),
    listReportRows: (academyId) =>
      fixture.failOn === academyId
        ? Promise.reject(new Error("DB 오류"))
        : Promise.resolve(fixture.rows?.[academyId] ?? []),
    listTeacherEmails: (academyId) =>
      Promise.resolve(fixture.emails?.[academyId] ?? ["t@a.com"]),
    listExpiredImages: (academyId) =>
      Promise.resolve(fixture.expired?.[academyId] ?? []),
    markImagesPurged: (ids) => {
      purged.push(...ids);
      return Promise.resolve();
    },
    saveLog: (log) => {
      logs.push(log);
      return Promise.resolve();
    },
  };
  return { repository, logs, purged };
}

describe("runMonthlyReport", () => {
  it("채점 작업이 있으면 선생님 전원에게 CSV를 첨부해 보내고 기록한다", async () => {
    const { repository, logs } = makeRepository({
      rows: { a1: [ROW, ROW] },
      emails: { a1: ["t1@a.com", "t2@a.com"] },
    });
    const mailer = { send: vi.fn().mockResolvedValue(undefined) };

    const [result] = await runMonthlyReport(
      { repository, mailer, storage: null },
      { period: PERIOD, now: NOW },
    );

    expect(result).toMatchObject({
      status: "sent",
      recipientCount: 2,
      jobCount: 2,
    });
    const message = mailer.send.mock.calls[0][0];
    expect(message.to).toEqual(["t1@a.com", "t2@a.com"]);
    expect(message.subject).toContain("2026년 10월");
    expect(message.attachments[0].filename).toBe("grading-report-2026-10.csv");
    expect(logs).toMatchObject([{ status: "sent", jobCount: 2, error: null }]);
  });

  it("이미 보낸 기간은 건너뛰고 아무것도 기록하지 않는다", async () => {
    const { repository, logs } = makeRepository({
      sent: ["a1"],
      rows: { a1: [ROW] },
    });
    const mailer = { send: vi.fn() };
    const [result] = await runMonthlyReport(
      { repository, mailer, storage: null },
      { period: PERIOD, now: NOW },
    );
    expect(result).toMatchObject({ status: "skipped", reason: "already_sent" });
    expect(mailer.send).not.toHaveBeenCalled();
    expect(logs).toHaveLength(0);
  });

  it("받는 사람이 없으면 보내지 않고, 사진도 정리하지 않는다", async () => {
    const { repository, logs, purged } = makeRepository({
      rows: { a1: [ROW] },
      emails: { a1: [] },
      expired: { a1: [{ jobId: "j1", imagePath: "a1/old.jpg" }] },
    });
    const storage = { remove: vi.fn().mockResolvedValue(undefined) };
    const [result] = await runMonthlyReport(
      { repository, mailer: { send: vi.fn() }, storage },
      { period: PERIOD, now: NOW },
    );
    expect(result).toMatchObject({
      status: "skipped",
      reason: "no_recipients",
    });
    expect(storage.remove).not.toHaveBeenCalled();
    expect(purged).toHaveLength(0);
    expect(logs[0]).toMatchObject({ status: "skipped" });
  });

  it("지난달 작업이 없으면 메일은 생략하고, 보관 기간이 지난 사진은 정리한다", async () => {
    const { repository, purged } = makeRepository({
      expired: { a1: [{ jobId: "j1", imagePath: "a1/old.jpg" }] },
    });
    const mailer = { send: vi.fn() };
    const storage = { remove: vi.fn().mockResolvedValue(undefined) };
    const [result] = await runMonthlyReport(
      { repository, mailer, storage },
      { period: PERIOD, now: NOW },
    );
    expect(mailer.send).not.toHaveBeenCalled();
    expect(storage.remove).toHaveBeenCalledWith(["a1/old.jpg"]);
    expect(purged).toEqual(["j1"]);
    expect(result).toMatchObject({
      status: "skipped",
      reason: "no_jobs",
      purgedImageCount: 1,
    });
  });

  it("저장소가 설정되지 않으면 사진 정리를 건너뛴다", async () => {
    const { repository, purged } = makeRepository({
      rows: { a1: [ROW] },
      expired: { a1: [{ jobId: "j1", imagePath: "a1/old.jpg" }] },
    });
    const [result] = await runMonthlyReport(
      {
        repository,
        mailer: { send: vi.fn().mockResolvedValue(undefined) },
        storage: null,
      },
      { period: PERIOD, now: NOW },
    );
    expect(result).toMatchObject({ status: "sent", purgedImageCount: 0 });
    expect(purged).toHaveLength(0);
  });

  it("메일 발송이 실패하면 사진을 정리하지 않고 실패로 기록하며, 다른 학원은 계속 처리한다", async () => {
    const { repository, logs, purged } = makeRepository({
      academies: [
        { id: "a1", name: "라온", imageRetentionMonths: 3 },
        { id: "a2", name: "브릿지", imageRetentionMonths: 3 },
      ],
      rows: { a1: [ROW], a2: [ROW] },
      expired: { a1: [{ jobId: "j1", imagePath: "a1/old.jpg" }] },
    });
    const mailer = {
      send: vi
        .fn()
        .mockRejectedValueOnce(new Error("메일 서버 오류"))
        .mockResolvedValueOnce(undefined),
    };
    const storage = { remove: vi.fn().mockResolvedValue(undefined) };

    const results = await runMonthlyReport(
      { repository, mailer, storage },
      { period: PERIOD, now: NOW },
    );

    expect(results.map((result) => result.status)).toEqual(["failed", "sent"]);
    expect(results[0].error).toBe("메일 서버 오류");
    expect(purged).not.toContain("j1");
    expect(logs.map((log) => log.status)).toEqual(["failed", "sent"]);
  });

  it("dryRun은 발송·정리·기록 없이 대상 건수만 계산한다", async () => {
    const { repository, logs } = makeRepository({
      rows: { a1: [ROW, ROW, ROW] },
    });
    const mailer = { send: vi.fn() };
    const storage = { remove: vi.fn() };
    const [result] = await runMonthlyReport(
      { repository, mailer, storage },
      { period: PERIOD, now: NOW, dryRun: true },
    );
    expect(result).toMatchObject({
      status: "skipped",
      reason: "dry_run",
      jobCount: 3,
      recipientCount: 1,
    });
    expect(mailer.send).not.toHaveBeenCalled();
    expect(storage.remove).not.toHaveBeenCalled();
    expect(logs).toHaveLength(0);
  });
});
