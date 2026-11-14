/**
 * 채점 결과 메일 보고서의 순수 로직 (기간 계산, CSV, 메일 본문, 보관 기간).
 * Deno·Supabase에 의존하지 않으므로 Vitest로 테스트한다. (report.test.ts)
 */

/** 한국 표준시 오프셋(분). 보고 기간의 날짜는 한국 시간 기준으로 자른다. */
export const KST_OFFSET_MINUTES = 9 * 60;

/** 발송 주기 (시스템 설정 mail.batch.cycle) */
export type ReportCycle = "DAILY" | "WEEKLY" | "MONTHLY";

/** 보고 대상 기간 (한국 시간 기준 날짜, [start, end)) */
export type ReportPeriod = {
  /** 시작일 YYYY-MM-DD (포함) */
  start: string;
  /** 종료일 YYYY-MM-DD (미포함) */
  end: string;
  /** 파일명용 표기 (월: 2026-10 / 주: 2026-10-26_2026-11-01 / 일: 2026-11-13) */
  label: string;
  /** 메일 제목·본문용 표기 (예: 2026년 10월) */
  title: string;
};

export type GradingStatus =
  "uploaded" | "processing" | "needs_review" | "completed" | "failed";

/** 보고서 한 줄 = 채점 작업(시험지 사진) 1건 */
export type ReportRow = {
  /** 업로드 시각 ISO 문자열 (UTC) */
  createdAt: string;
  studentName: string;
  className: string;
  sheetTitle: string;
  sheetType: "subjective" | "objective";
  status: GradingStatus;
  score: number | null;
  items: {
    questionNo: number;
    /** 자동 판정 */
    isCorrect: boolean | null;
    /** 선생님 수동 판정 (있으면 우선) */
    reviewedIsCorrect: boolean | null;
    needsReview: boolean;
  }[];
};

export type ReportSummary = {
  total: number;
  completed: number;
  needsReview: number;
  /** 점수가 있는 작업의 평균 (없으면 null) */
  averageScore: number | null;
};

export const STATUS_LABEL: Record<GradingStatus, string> = {
  uploaded: "업로드 완료",
  processing: "채점 중",
  needs_review: "검토 필요",
  completed: "채점 완료",
  failed: "인식 실패",
};

const SHEET_TYPE_LABEL = { subjective: "주관식", objective: "객관식" } as const;

const DAY_MS = 86_400_000;

/**
 * 날짜(UTC 자정 기준 Date)를 YYYY-MM-DD로 표시한다.
 * @param {Date} date - 날짜
 * @returns {string}
 */
function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * 실행 시각의 한국 시간 "오늘" 날짜를 UTC 자정 Date로 구한다. (날짜 계산 전용)
 * @param {Date} now - 실행 시각
 * @returns {Date}
 */
function kstToday(now: Date) {
  const kst = new Date(now.getTime() + KST_OFFSET_MINUTES * 60_000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

/**
 * 월 단위 보고 기간을 만든다.
 * @param {number} year - 연도
 * @param {number} month - 월 (1~12)
 * @returns {ReportPeriod}
 */
function monthPeriod(year: number, month: number): ReportPeriod {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return {
    start: toDateString(start),
    end: toDateString(end),
    label: toDateString(start).slice(0, 7),
    title: `${year}년 ${month}월`,
  };
}

/**
 * 시작일부터 days일 동안의 보고 기간을 만든다. (주·일 단위)
 * @param {Date} start - 시작일 (UTC 자정 기준)
 * @param {number} days - 일수 (1 또는 7)
 * @returns {ReportPeriod}
 */
function dayRangePeriod(start: Date, days: number): ReportPeriod {
  const end = new Date(start.getTime() + days * DAY_MS);
  const last = new Date(end.getTime() - DAY_MS);
  const format = (date: Date) => `${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일`;
  const startTitle = `${start.getUTCFullYear()}년 ${format(start)}`;
  return {
    start: toDateString(start),
    end: toDateString(end),
    label: days === 1 ? toDateString(start) : `${toDateString(start)}_${toDateString(last)}`,
    title: days === 1 ? startTitle : `${startTitle} ~ ${format(last)}`,
  };
}

/**
 * 실행 시각 기준 직전 기간(한국 시간)을 주기에 맞게 구한다.
 * - DAILY: 어제 / WEEKLY: 지난주 월~일 / MONTHLY: 지난달
 * @param {Date} now - 실행 시각
 * @param {ReportCycle} cycle - 발송 주기
 * @returns {ReportPeriod}
 */
export function getPreviousPeriod(now: Date, cycle: ReportCycle): ReportPeriod {
  const today = kstToday(now);
  if (cycle === "DAILY") return dayRangePeriod(new Date(today.getTime() - DAY_MS), 1);
  if (cycle === "WEEKLY") {
    const daysSinceMonday = (today.getUTCDay() + 6) % 7; // 월요일 0 … 일요일 6
    const thisMonday = new Date(today.getTime() - daysSinceMonday * DAY_MS);
    return dayRangePeriod(new Date(thisMonday.getTime() - 7 * DAY_MS), 7);
  }
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1; // 이번 달
  return month === 1 ? monthPeriod(year - 1, 12) : monthPeriod(year, month - 1);
}

/**
 * 실행 시각 기준 "지난달"(한국 시간) 보고 기간을 구한다.
 * @param {Date} now - 실행 시각
 * @returns {ReportPeriod}
 */
export function getPreviousMonthPeriod(now: Date): ReportPeriod {
  return getPreviousPeriod(now, "MONTHLY");
}

/**
 * 오늘(한국 시간)이 주기상 발송하는 날인지 확인한다.
 * - DAILY: 매일 / WEEKLY: 월요일 / MONTHLY: 1일
 * @param {Date} now - 실행 시각
 * @param {ReportCycle} cycle - 발송 주기
 * @returns {boolean}
 */
export function isScheduledDay(now: Date, cycle: ReportCycle) {
  const today = kstToday(now);
  if (cycle === "WEEKLY") return today.getUTCDay() === 1;
  if (cycle === "MONTHLY") return today.getUTCDate() === 1;
  return true;
}

/**
 * 수동 실행용 기간 문자열을 보고 기간으로 바꾼다.
 * - "YYYY-MM": 해당 월
 * - "YYYY-MM-DD": 해당 일
 * @param {string} value - 예: "2026-10", "2026-11-13"
 * @returns {ReportPeriod}
 */
export function parsePeriod(value: string): ReportPeriod {
  const invalid = new Error(`기간 형식이 올바르지 않습니다: ${value} (예: 2026-10 또는 2026-11-13)`);
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(value);
  if (monthMatch) {
    const month = Number(monthMatch[2]);
    if (month < 1 || month > 12) throw invalid;
    return monthPeriod(Number(monthMatch[1]), month);
  }
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dayMatch) {
    const date = new Date(Date.UTC(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3])));
    // 2026-02-30처럼 존재하지 않는 날짜는 Date가 다음 달로 넘기므로 원문과 비교해 거부한다.
    if (Number.isNaN(date.getTime()) || toDateString(date) !== value) throw invalid;
    return dayRangePeriod(date, 1);
  }
  throw invalid;
}

/**
 * 보고 기간(한국 시간 날짜)을 DB 조회용 UTC 시각 범위로 바꾼다.
 * @param {ReportPeriod} period - 보고 기간
 * @returns {{ from: string, to: string }} ISO 문자열 [from, to)
 */
export function periodToUtcRange(period: ReportPeriod) {
  const toUtc = (date: string) =>
    new Date(
      Date.parse(`${date}T00:00:00Z`) - KST_OFFSET_MINUTES * 60_000,
    ).toISOString();
  return { from: toUtc(period.start), to: toUtc(period.end) };
}

/**
 * 보관 기간이 지난 기준 시각을 구한다. (이 시각 이전에 올린 원본 사진이 정리 대상)
 * 말일 보정: 3/31에서 1개월 전은 2/28(또는 29)로 계산한다.
 * @param {Date} now - 실행 시각
 * @param {number} months - 보관 개월 수
 * @returns {Date}
 */
export function retentionCutoff(now: Date, months: number) {
  const cutoff = new Date(now.getTime());
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  const lastDay = new Date(
    Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0),
  ).getUTCDate();
  cutoff.setUTCDate(Math.min(day, lastDay));
  return cutoff;
}

/**
 * 문항의 최종 판정 (선생님 수동 판정 우선).
 * @param {ReportRow["items"][number]} item - 문항 결과
 * @returns {boolean | null}
 */
function finalCorrect(item: ReportRow["items"][number]) {
  return item.reviewedIsCorrect ?? item.isCorrect;
}

/**
 * CSV 칸 값을 안전하게 만든다.
 * - 쉼표·따옴표·줄바꿈이 있으면 따옴표로 감싼다.
 * - =, +, -, @ 로 시작하면 엑셀 수식으로 실행되지 않도록 앞에 ' 를 붙인다. (CSV 인젝션 방지)
 * @param {string | number | null} value - 값
 * @returns {string}
 */
export function csvCell(value: string | number | null) {
  if (value === null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * UTC ISO 시각을 한국 시간 "YYYY-MM-DD HH:mm"으로 표시한다.
 * @param {string} iso - ISO 문자열
 * @returns {string}
 */
export function formatKst(iso: string) {
  const kst = new Date(
    Date.parse(iso) + KST_OFFSET_MINUTES * 60_000,
  ).toISOString();
  return `${kst.slice(0, 10)} ${kst.slice(11, 16)}`;
}

/** 엑셀이 UTF-8 CSV를 한글로 인식하도록 붙이는 BOM (보이지 않는 문자라 코드로 명시) */
const UTF8_BOM = String.fromCharCode(0xfeff);

export const CSV_HEADER = [
  "업로드 시각",
  "학생",
  "클래스",
  "시험지",
  "유형",
  "상태",
  "점수",
  "정답 수",
  "문항 수",
  "검토 필요 문항",
  "문항별 결과",
];

/**
 * 채점 작업 목록을 CSV로 만든다. 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다.
 * 문항별 결과 표기: O 정답 / X 오답 / ? 미판정
 * @param {ReportRow[]} rows - 채점 작업 목록
 * @returns {string}
 */
export function buildCsv(rows: ReportRow[]) {
  const lines = rows.map((row) => {
    const items = [...row.items].sort((a, b) => a.questionNo - b.questionNo);
    const correctCount = items.filter(
      (item) => finalCorrect(item) === true,
    ).length;
    const reviewList = items
      .filter((item) => item.needsReview)
      .map((item) => item.questionNo);
    const marks = items
      .map((item) => {
        const result = finalCorrect(item);
        return `${item.questionNo}:${result === null ? "?" : result ? "O" : "X"}`;
      })
      .join(" ");
    return [
      formatKst(row.createdAt),
      row.studentName,
      row.className,
      row.sheetTitle,
      SHEET_TYPE_LABEL[row.sheetType],
      STATUS_LABEL[row.status],
      row.score,
      correctCount,
      items.length,
      reviewList.join(" "),
      marks,
    ]
      .map(csvCell)
      .join(",");
  });
  return `${UTF8_BOM}${[CSV_HEADER.join(","), ...lines].join("\r\n")}\r\n`;
}

/**
 * 채점 작업 목록을 요약한다.
 * @param {ReportRow[]} rows - 채점 작업 목록
 * @returns {ReportSummary}
 */
export function summarize(rows: ReportRow[]): ReportSummary {
  const scores = rows
    .map((row) => row.score)
    .filter((score): score is number => score !== null);
  return {
    total: rows.length,
    completed: rows.filter((row) => row.status === "completed").length,
    needsReview: rows.filter((row) => row.status === "needs_review").length,
    averageScore: scores.length
      ? Math.round(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10,
        ) / 10
      : null,
  };
}

/**
 * HTML 특수문자를 이스케이프한다.
 * @param {string} value - 원문
 * @returns {string}
 */
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * 보고서 메일 제목·본문을 만든다.
 * @param {object} params
 * @param {string} params.academyName - 학원 이름
 * @param {ReportPeriod} params.period - 보고 기간
 * @param {ReportSummary} params.summary - 요약
 * @param {number} params.retentionMonths - 원본 사진 보관 개월 수
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildEmail({
  academyName,
  period,
  summary,
  retentionMonths,
}: {
  academyName: string;
  period: ReportPeriod;
  summary: ReportSummary;
  retentionMonths: number;
}) {
  const { title } = period;
  const lines = [
    `전체 시험지: ${summary.total}건`,
    `채점 완료: ${summary.completed}건`,
    `검토 필요: ${summary.needsReview}건`,
    `평균 점수: ${summary.averageScore ?? "-"}`,
  ];
  const notice = `원본 사진은 업로드 후 ${retentionMonths}개월이 지나면 삭제됩니다. 채점 결과는 첨부한 CSV와 앱에서 계속 확인할 수 있습니다.`;

  return {
    subject: `[쪽지시험] ${academyName} ${title} 채점 결과`,
    text: [
      `${academyName} ${title} 채점 결과입니다.`,
      "",
      ...lines,
      "",
      notice,
    ].join("\n"),
    html: [
      `<h2>${escapeHtml(academyName)} ${title} 채점 결과</h2>`,
      `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`,
      `<p>문항별 결과는 첨부한 CSV 파일에서 확인하세요.</p>`,
      `<p style="color:#75817c;font-size:12px">${escapeHtml(notice)}</p>`,
    ].join(""),
  };
}

/**
 * 문자열을 UTF-8 base64로 인코딩한다. (메일 첨부용, Deno·브라우저·Node 공통)
 * @param {string} text - 원문
 * @returns {string}
 */
export function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}
