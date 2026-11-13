import { describe, expect, it } from "vitest";
import type { MyPaper } from "@/type";
import { buildPeriodOptions, filterPapers, getWeekKey } from "./paper-history";

const PAPERS: MyPaper[] = [
  {
    id: 1,
    title: "A",
    category: "c",
    uploaded: "06.01 17:20",
    date: "2026-06-01",
    status: "업로드 완료",
  },
  {
    id: 2,
    title: "B",
    category: "c",
    uploaded: "05.30 19:10",
    date: "2026-05-30",
    status: "채점 완료",
    score: 80,
  },
  {
    id: 3,
    title: "C",
    category: "c",
    uploaded: "05.24 14:12",
    date: "2026-05-24",
    status: "채점 완료",
    score: 90,
  },
];

describe("getWeekKey", () => {
  it("연도-주차 키를 만든다 (1월 1일이 1주차)", () => {
    expect(getWeekKey("2026-01-01")).toBe("2026-01");
    // 2026-01-01은 목요일 → 일요일인 1월 4일부터 2주차
    expect(getWeekKey("2026-01-03")).toBe("2026-01");
    expect(getWeekKey("2026-01-04")).toBe("2026-02");
  });
});

describe("buildPeriodOptions", () => {
  it("전체 구분은 '전체 기간' 하나만 반환한다", () => {
    expect(buildPeriodOptions(PAPERS, "all")).toEqual([
      { value: "all", label: "전체 기간" },
    ]);
  });

  it("월별 구분은 중복 없이 월 목록을 만든다", () => {
    expect(buildPeriodOptions(PAPERS, "month")).toEqual([
      { value: "all", label: "전체 월" },
      { value: "2026-06", label: "2026년 06월" },
      { value: "2026-05", label: "2026년 05월" },
    ]);
  });

  it("주별 구분은 첫 항목이 '전체 주'이고 주차 라벨을 만든다", () => {
    const options = buildPeriodOptions(PAPERS, "week");
    expect(options[0]).toEqual({ value: "all", label: "전체 주" });
    expect(
      options.every(
        (option, index) => index === 0 || option.label.endsWith("주차"),
      ),
    ).toBe(true);
  });
});

describe("filterPapers", () => {
  it("상태로 거른다", () => {
    expect(
      filterPapers(PAPERS, {
        periodType: "all",
        period: "all",
        status: "채점 완료",
      }).map((p) => p.id),
    ).toEqual([2, 3]);
  });

  it("월 기간으로 거른다", () => {
    expect(
      filterPapers(PAPERS, {
        periodType: "month",
        period: "2026-05",
        status: "all",
      }).map((p) => p.id),
    ).toEqual([2, 3]);
  });

  it("주 기간으로 거른다", () => {
    const week = getWeekKey("2026-06-01");
    expect(
      filterPapers(PAPERS, {
        periodType: "week",
        period: week,
        status: "all",
      }).map((p) => p.id),
    ).toContain(1);
  });
});
