import type { GradingRecord } from "@/type";
import { GRADING_RECORDS } from "@/lib/mock-data";

/** 채점 관리 필터 값. select의 "all"은 전체를 의미한다. */
export type GradingFilter = {
  search: string;
  academy: string;
  className: string;
  category: string;
  status: string;
  /** YYYY-MM-DD */
  from: string;
  /** YYYY-MM-DD */
  to: string;
};

export const INITIAL_GRADING_FILTER: GradingFilter = {
  search: "",
  academy: "all",
  className: "all",
  category: "all",
  status: "all",
  from: "",
  to: "",
};

/**
 * 기록 목록에서 특정 필드의 값을 중복 없이 추린다. (필터 select 옵션용)
 * @param {GradingRecord[]} records - 채점 기록
 * @param {keyof GradingRecord} key - 추릴 필드
 * @returns {string[]}
 */
function uniqueValues(records: GradingRecord[], key: keyof GradingRecord) {
  return [...new Set(records.map((record) => String(record[key])))];
}

/** 필터 select 옵션 (TODO: Supabase 연동 시 학원/클래스/카테고리 테이블에서 조회) */
export const GRADING_FILTER_OPTIONS = {
  academy: uniqueValues(GRADING_RECORDS, "academy"),
  className: uniqueValues(GRADING_RECORDS, "className"),
  category: uniqueValues(GRADING_RECORDS, "category"),
  status: ["검토 필요", "채점 완료"],
};

/**
 * 채점 기록 날짜("MM.DD HH:MM")를 비교 가능한 ISO("2026-MM-DD")로 바꾼다.
 * @param {GradingRecord} record - 채점 기록
 * @returns {string} ISO 날짜
 */
function toISODate(record: GradingRecord) {
  const [month, day] = record.date.split(" ")[0].split(".");
  return `2026-${month}-${day}`;
}

/**
 * 필터 조건에 맞는 채점 기록만 반환한다.
 * @param {GradingRecord[]} records - 채점 기록
 * @param {GradingFilter} filter - 필터 값
 * @returns {GradingRecord[]}
 */
export function filterGradingRecords(
  records: GradingRecord[],
  filter: GradingFilter,
) {
  const query = filter.search.trim().toLowerCase();
  const matches = (value: string, selected: string) =>
    selected === "all" || value === selected;

  return records.filter((record) => {
    const date = toISODate(record);
    return (
      (!query ||
        `${record.student} ${record.paper}`.toLowerCase().includes(query)) &&
      matches(record.academy, filter.academy) &&
      matches(record.className, filter.className) &&
      matches(record.category, filter.category) &&
      matches(record.status, filter.status) &&
      (!filter.from || date >= filter.from) &&
      (!filter.to || date <= filter.to)
    );
  });
}
