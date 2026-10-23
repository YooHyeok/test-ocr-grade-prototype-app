import type { MyPaper } from "@/type";

/** 시험지 이력 기간 구분 */
export type PeriodType = "all" | "month" | "week";

export const PAPERS_PER_PAGE = 4;

export const PERIOD_TABS: { value: PeriodType; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "month", label: "월별" },
  { value: "week", label: "주별" },
];

export const PAPER_STATUS_OPTIONS = ["업로드 완료", "채점 완료"];

/**
 * 날짜의 연도-주차 키("YYYY-WW")를 구한다.
 * @param {string} date - YYYY-MM-DD
 * @returns {string}
 */
export function getWeekKey(date: string) {
  const value = new Date(`${date}T00:00:00`);
  const first = new Date(value.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((value.getTime() - first.getTime()) / 86400000 + first.getDay() + 1) / 7,
  );
  return `${value.getFullYear()}-${String(week).padStart(2, "0")}`;
}

/**
 * 기간 구분에 맞는 상세 기간 select 옵션을 만든다.
 * @param {MyPaper[]} papers - 시험지 이력
 * @param {PeriodType} type - 기간 구분
 * @returns {{ value: string; label: string }[]} 첫 항목은 항상 "all"
 */
export function buildPeriodOptions(papers: MyPaper[], type: PeriodType) {
  if (type === "month") {
    const months = [...new Set(papers.map((paper) => paper.date.slice(0, 7)))];
    return [
      { value: "all", label: "전체 월" },
      ...months.map((month) => ({
        value: month,
        label: `${month.replace("-", "년 ")}월`,
      })),
    ];
  }
  if (type === "week") {
    const weeks = [...new Set(papers.map((paper) => getWeekKey(paper.date)))];
    return [
      { value: "all", label: "전체 주" },
      ...weeks.map((week) => ({
        value: week,
        label: `${week.slice(0, 4)}년 ${Number(week.slice(5))}주차`,
      })),
    ];
  }
  return [{ value: "all", label: "전체 기간" }];
}

/**
 * 기간·상태 조건에 맞는 시험지 이력만 반환한다.
 * @param {MyPaper[]} papers - 시험지 이력
 * @param {object} filter
 * @param {PeriodType} filter.periodType - 기간 구분
 * @param {string} filter.period - 상세 기간 ("all" 또는 월/주 키)
 * @param {string} filter.status - 상태 ("all" 또는 상태값)
 * @returns {MyPaper[]}
 */
export function filterPapers(
  papers: MyPaper[],
  {
    periodType,
    period,
    status,
  }: { periodType: PeriodType; period: string; status: string },
) {
  return papers.filter((paper) => {
    const matchesStatus = status === "all" || paper.status === status;
    const matchesPeriod =
      period === "all" ||
      (periodType === "month"
        ? paper.date.startsWith(period)
        : getWeekKey(paper.date) === period);
    return matchesStatus && matchesPeriod;
  });
}
