import { describe, expect, it } from "vitest";
import {
  CODE_SEGMENT_PATTERN,
  joinMultiValue,
  splitMultiValue,
  validateNewOption,
  GROUP_CODE_PATTERN,
  buildSections,
  diffSettingValues,
  kstDayRange,
  kstToday,
  parentCode,
  rootCode,
  validateSettingValue,
} from "./system-settings";
import type { SystemSetting } from "@/lib/backend/types";

/**
 * 테스트용 시스템 설정 항목을 만든다.
 * @param {Partial<SystemSetting> & { key: string }} input - 바꿀 값
 * @returns {SystemSetting}
 */
const setting = (
  input: Partial<SystemSetting> & { key: string },
): SystemSetting => ({
  id: input.key,
  groupId: "WM",
  subGroupId: null,
  name: input.key,
  description: null,
  type: "STR",
  value: null,
  options: null,
  access: "W",
  ...input,
});

describe("설정 값·코드 검사", () => {
  it("값 종류와 선택 목록에 맞는지 검사하고, 빈 값은 허용한다", () => {
    const bool = { type: "BOOL", options: null } as const;
    expect(validateSettingValue(bool, "true")).toBeNull();
    expect(validateSettingValue(bool, "Y")).not.toBeNull();
    expect(validateSettingValue(bool, "")).toBeNull();
    const num = { type: "NUM", options: null } as const;
    expect(validateSettingValue(num, "-0.85")).toBeNull();
    expect(validateSettingValue(num, "1e3")).not.toBeNull();
    const radio = { type: "RADIO", options: ["DAILY", "WEEKLY"] } as const;
    expect(
      validateSettingValue({ ...radio, options: [...radio.options] }, "DAILY"),
    ).toBeNull();
    expect(
      validateSettingValue(
        { ...radio, options: [...radio.options] },
        "MONTHLY",
      ),
    ).toContain("DAILY, WEEKLY");
    expect(validateSettingValue({ type: "SEL", options: null }, "")).toContain(
      "선택지를 하나 이상",
    );
    const check = { type: "CHECK" as const, options: ["A", "B", "C"] };
    expect(validateSettingValue(check, "A,C")).toBeNull();
    expect(validateSettingValue(check, "A,Z")).not.toBeNull();
    expect(
      validateSettingValue({ type: "STR", options: null }, "a,b !@#"),
    ).toBeNull();
  });

  it("코드는 영문 대문자·숫자·밑줄, 점으로 계층", () => {
    expect(GROUP_CODE_PATTERN.test("WM.MAIL_BATCH")).toBe(true);
    expect(GROUP_CODE_PATTERN.test("wm.mail")).toBe(false);
    expect(GROUP_CODE_PATTERN.test("WM..X")).toBe(false);
    expect(CODE_SEGMENT_PATTERN.test("MIN_CONFIDENCE")).toBe(true);
    expect(CODE_SEGMENT_PATTERN.test("A.B")).toBe(false);
  });

  it("상위·최상위 그룹 코드", () => {
    expect(parentCode("WM.MAIL_BATCH")).toBe("WM");
    expect(parentCode("WM")).toBeNull();
    expect(rootCode("WM.MAIL_BATCH.X")).toBe("WM");
  });
});

describe("탭 안의 구역", () => {
  const settings = [
    setting({
      key: "WM.MAIL_BATCH.ENABLED",
      subGroupId: "WM.MAIL_BATCH",
      name: "메일 배치 사용 여부",
    }),
    setting({
      key: "WM.COMMON.TIMEOUT",
      subGroupId: "WM.COMMON",
      name: "자동 로그아웃 시간",
      value: "240",
    }),
    setting({
      key: "WM.COMMON.SECRET",
      subGroupId: "WM.COMMON",
      name: "숨김",
      access: "H",
    }),
    setting({ key: "WM.TOP", name: "최상위 바로 아래" }),
    setting({ key: "OTHER.X", groupId: "OTHER" }),
  ];
  const groups = [
    { id: "WM", name: "쪽지시험", description: null },
    { id: "WM.COMMON", name: "공통", description: null },
    { id: "WM.MAIL_BATCH", name: "메일 배치", description: null },
  ];

  it("탭(최상위 그룹)의 설정을 하위 그룹별로 묶고, 항목 숨김은 뺀다", () => {
    expect(
      buildSections(settings, groups, { rootId: "WM", query: "" }).map(
        (section) => [section.name, section.settings.map((item) => item.key)],
      ),
    ).toEqual([
      ["쪽지시험", ["WM.TOP"]],
      ["공통", ["WM.COMMON.TIMEOUT"]],
      ["메일 배치", ["WM.MAIL_BATCH.ENABLED"]],
    ]);
  });

  it("검색어로 거르면 빈 구역은 빠진다", () => {
    expect(
      buildSections(settings, groups, { rootId: "WM", query: "240" }).map(
        (s) => s.id,
      ),
    ).toEqual(["WM.COMMON"]);
  });

  it("고친 값 중 저장된 값과 다른 것만 저장 요청으로 만든다", () => {
    expect(
      diffSettingValues(settings, {
        "WM.COMMON.TIMEOUT": "240",
        "WM.TOP": "x",
      }),
    ).toEqual([{ key: "WM.TOP", value: "x" }]);
  });
});

describe("변경 이력 조회 일자", () => {
  it("한국 시간 오늘과 하루 범위(UTC)", () => {
    expect(kstToday(new Date("2026-11-13T15:30:00Z"))).toBe("2026-11-14");
    expect(kstDayRange("2026-11-14")).toEqual({
      from: "2026-11-13T15:00:00.000Z",
      to: "2026-11-14T15:00:00.000Z",
    });
  });
});

describe("선택지·체크박스 값", () => {
  it("체크박스 값은 선택지 순서대로 쉼표로 잇는다", () => {
    expect(joinMultiValue(["A", "B", "C"], ["C", "A"])).toBe("A,C");
    expect(splitMultiValue("A,C")).toEqual(["A", "C"]);
    expect(splitMultiValue("")).toEqual([]);
  });

  it("선택지는 비거나 쉼표가 있거나 중복이면 추가할 수 없다", () => {
    expect(validateNewOption(["A"], "B")).toBeNull();
    expect(validateNewOption(["A"], " ")).not.toBeNull();
    expect(validateNewOption(["A"], "B,C")).toContain("쉼표");
    expect(validateNewOption(["A"], "A")).toContain("이미");
  });
});
