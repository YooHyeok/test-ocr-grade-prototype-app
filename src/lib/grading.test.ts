import { describe, expect, it } from "vitest";
import type { GradingRecord } from "@/type";
import { INITIAL_GRADING_FILTER, filterGradingRecords } from "./grading";

const RECORDS: GradingRecord[] = [
  {
    date: "06.01 16:42",
    student: "유학생",
    grade: "고2",
    academy: "라온",
    className: "고2 화학 I",
    category: "화학 I · 산화 환원",
    paper: "산화 환원 미니테스트",
    score: 90,
    status: "채점 완료",
  },
  {
    date: "06.01 15:44",
    student: "황학생",
    grade: "중3",
    academy: "브릿지",
    className: "중3 화학 심화",
    category: "중등 화학 · 이온",
    paper: "이온과 앙금",
    score: 75,
    status: "검토 필요",
  },
  {
    date: "05.31 19:20",
    student: "김학생",
    grade: "고1",
    academy: "라온",
    className: "고1 통합과학 A",
    category: "통합과학 · 물질",
    paper: "물질의 규칙성",
    score: 87,
    status: "채점 완료",
  },
];

describe("filterGradingRecords", () => {
  it("초기 필터는 전체 기록을 반환한다", () => {
    expect(filterGradingRecords(RECORDS, INITIAL_GRADING_FILTER)).toHaveLength(
      3,
    );
  });

  it("검색어는 학생 이름과 시험지 이름에서 찾는다", () => {
    expect(
      filterGradingRecords(RECORDS, {
        ...INITIAL_GRADING_FILTER,
        search: "황",
      }),
    ).toEqual([RECORDS[1]]);
    expect(
      filterGradingRecords(RECORDS, {
        ...INITIAL_GRADING_FILTER,
        search: " 규칙성 ",
      }),
    ).toEqual([RECORDS[2]]);
  });

  it("학원·상태 조건을 함께 적용한다", () => {
    const result = filterGradingRecords(RECORDS, {
      ...INITIAL_GRADING_FILTER,
      academy: "라온",
      status: "채점 완료",
    });
    expect(result.map((record) => record.student)).toEqual([
      "유학생",
      "김학생",
    ]);
  });

  it("채점일 범위는 시작일·종료일을 포함한다", () => {
    const result = filterGradingRecords(RECORDS, {
      ...INITIAL_GRADING_FILTER,
      from: "2026-06-01",
      to: "2026-06-01",
    });
    expect(result).toHaveLength(2);
    expect(
      filterGradingRecords(RECORDS, {
        ...INITIAL_GRADING_FILTER,
        to: "2026-05-31",
      }),
    ).toEqual([RECORDS[2]]);
  });
});
