import { describe, expect, it } from "vitest";
import {
  buildCsv,
  buildEmail,
  csvCell,
  formatKst,
  getPreviousMonthPeriod,
  getPreviousPeriod,
  isScheduledDay,
  parsePeriod,
  periodToUtcRange,
  retentionCutoff,
  summarize,
  toBase64,
  type ReportRow,
} from "./report.ts";

const ROW: ReportRow = {
  createdAt: "2026-10-05T01:30:00.000Z", // KST 10:30
  studentName: "김학생",
  className: "고2 화학 I",
  sheetTitle: "산화 환원, 미니테스트",
  sheetType: "subjective",
  status: "completed",
  score: 80,
  items: [
    {
      questionNo: 2,
      isCorrect: false,
      reviewedIsCorrect: true,
      needsReview: true,
    },
    {
      questionNo: 1,
      isCorrect: true,
      reviewedIsCorrect: null,
      needsReview: false,
    },
    {
      questionNo: 3,
      isCorrect: null,
      reviewedIsCorrect: null,
      needsReview: false,
    },
  ],
};

describe("보고 기간", () => {
  it("한국 시간 기준 지난달을 구한다 (UTC로는 전월 말일이어도 KST로 이번 달 1일이면 지난달)", () => {
    // 2026-11-01 00:05 UTC = 2026-11-01 09:05 KST → 10월
    expect(getPreviousMonthPeriod(new Date("2026-11-01T00:05:00Z"))).toEqual({
      start: "2026-10-01",
      end: "2026-11-01",
      label: "2026-10",
      title: "2026년 10월",
    });
    // 2026-10-31 15:30 UTC = 2026-11-01 00:30 KST → 10월
    expect(getPreviousMonthPeriod(new Date("2026-10-31T15:30:00Z")).label).toBe(
      "2026-10",
    );
  });

  it("1월에 실행하면 전년도 12월이다", () => {
    expect(getPreviousMonthPeriod(new Date("2027-01-01T00:05:00Z"))).toEqual({
      start: "2026-12-01",
      end: "2027-01-01",
      label: "2026-12",
      title: "2026년 12월",
    });
  });

  it("YYYY-MM 문자열을 해석하고, 잘못된 형식은 거부한다", () => {
    expect(parsePeriod("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-03-01",
      label: "2026-02",
      title: "2026년 2월",
    });
    expect(() => parsePeriod("2026-13")).toThrow();
    expect(() => parsePeriod("26-1")).toThrow();
  });

  it("YYYY-MM-DD 문자열은 하루 기간이고, 없는 날짜는 거부한다", () => {
    expect(parsePeriod("2026-11-13")).toEqual({
      start: "2026-11-13",
      end: "2026-11-14",
      label: "2026-11-13",
      title: "2026년 11월 13일",
    });
    expect(() => parsePeriod("2026-02-30")).toThrow();
    expect(() => parsePeriod("2026-11-1")).toThrow();
  });

  it("매일 주기는 한국 시간 기준 어제다", () => {
    // 2026-11-13 15:30 UTC = 2026-11-14 00:30 KST → 11월 13일
    expect(getPreviousPeriod(new Date("2026-11-13T15:30:00Z"), "DAILY")).toEqual({
      start: "2026-11-13",
      end: "2026-11-14",
      label: "2026-11-13",
      title: "2026년 11월 13일",
    });
  });

  it("매주 주기는 지난주 월~일이고, 월말을 넘어가도 이어진다", () => {
    // 2026-11-02(월) 09:05 KST → 10월 26일(월) ~ 11월 1일(일)
    expect(getPreviousPeriod(new Date("2026-11-02T00:05:00Z"), "WEEKLY")).toEqual({
      start: "2026-10-26",
      end: "2026-11-02",
      label: "2026-10-26_2026-11-01",
      title: "2026년 10월 26일 ~ 11월 1일",
    });
    // 같은 주 수요일에 실행해도 지난주를 돌려준다.
    expect(getPreviousPeriod(new Date("2026-11-04T00:05:00Z"), "WEEKLY").start).toBe("2026-10-26");
  });

  it("주기별로 발송하는 날을 한국 시간 기준으로 판단한다", () => {
    const mondayKst = new Date("2026-11-01T15:30:00Z"); // 2026-11-02(월) 00:30 KST
    const firstDayKst = new Date("2026-10-31T15:30:00Z"); // 2026-11-01(일) 00:30 KST
    expect(isScheduledDay(mondayKst, "WEEKLY")).toBe(true);
    expect(isScheduledDay(firstDayKst, "WEEKLY")).toBe(false);
    expect(isScheduledDay(firstDayKst, "MONTHLY")).toBe(true);
    expect(isScheduledDay(mondayKst, "MONTHLY")).toBe(false);
    expect(isScheduledDay(mondayKst, "DAILY")).toBe(true);
  });

  it("한국 시간 월 경계를 UTC 범위로 바꾼다", () => {
    expect(periodToUtcRange(parsePeriod("2026-10"))).toEqual({
      from: "2026-09-30T15:00:00.000Z",
      to: "2026-10-31T15:00:00.000Z",
    });
  });
});

describe("보관 기간 기준 시각", () => {
  it("N개월 전 같은 날짜를 구하고, 없는 날짜는 말일로 맞춘다", () => {
    expect(
      retentionCutoff(new Date("2026-11-01T00:05:00Z"), 3).toISOString(),
    ).toBe("2026-08-01T00:05:00.000Z");
    expect(
      retentionCutoff(new Date("2026-05-31T00:00:00Z"), 3).toISOString(),
    ).toBe("2026-02-28T00:00:00.000Z");
    expect(
      retentionCutoff(new Date("2026-01-15T00:00:00Z"), 1).toISOString(),
    ).toBe("2025-12-15T00:00:00.000Z");
  });
});

describe("CSV", () => {
  it("쉼표·따옴표·줄바꿈은 따옴표로 감싸고, 수식으로 시작하는 값은 무력화한다", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell(-5)).toBe("-5");
    expect(csvCell(null)).toBe("");
  });

  it("업로드 시각은 한국 시간으로 표시한다", () => {
    expect(formatKst("2026-10-31T15:30:00Z")).toBe("2026-11-01 00:30");
  });

  it("BOM과 헤더를 붙이고, 문항은 번호순·수동 판정 우선으로 표시한다", () => {
    const csv = buildCsv([ROW]);
    expect(csv.startsWith("\uFEFF업로드 시각,학생,")).toBe(true);
    const line = csv.trim().split("\r\n")[1];
    expect(line).toBe(
      '2026-10-05 10:30,김학생,고2 화학 I,"산화 환원, 미니테스트",주관식,채점 완료,80,2,3,2,1:O 2:O 3:?',
    );
  });
});

describe("요약·메일", () => {
  it("건수와 평균 점수를 계산한다", () => {
    const rows: ReportRow[] = [
      ROW,
      { ...ROW, status: "needs_review", score: 71 },
      { ...ROW, status: "uploaded", score: null },
    ];
    expect(summarize(rows)).toEqual({
      total: 3,
      completed: 1,
      needsReview: 1,
      averageScore: 75.5,
    });
    expect(summarize([]).averageScore).toBeNull();
  });

  it("제목에 학원·월을 넣고 HTML은 이스케이프한다", () => {
    const email = buildEmail({
      academyName: "라온<과학>",
      period: parsePeriod("2026-10"),
      summary: summarize([ROW]),
      retentionMonths: 3,
    });
    expect(email.subject).toBe("[쪽지시험] 라온<과학> 2026년 10월 채점 결과");
    expect(email.html).toContain("라온&lt;과학&gt;");
    expect(email.text).toContain("3개월");
  });

  it("한글을 UTF-8 base64로 인코딩한다", () => {
    expect(toBase64("가")).toBe("6rCA");
  });
});
