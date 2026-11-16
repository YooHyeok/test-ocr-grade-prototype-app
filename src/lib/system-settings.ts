import type {
  SystemSetting,
  SystemSettingAccess,
  SystemSettingAction,
  SystemSettingChange,
  SystemSettingGroup,
  SystemSettingType,
} from "@/lib/backend/types";

/** 그룹 코드 형식 (영문 대문자·숫자·밑줄, 점으로 계층. DB check 제약과 같다) 예: WM.MAIL_BATCH */
export const GROUP_CODE_PATTERN = /^[A-Z][A-Z0-9_]*(\.[A-Z][A-Z0-9_]*)*$/;

/** 그룹 코드 한 마디·속성 키 이름 형식 예: MAIL_BATCH, ENABLED */
export const CODE_SEGMENT_PATTERN = /^[A-Z][A-Z0-9_]*$/;

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

/** 값 유형 표시명 (유형 선택 상자 순서) */
export const SETTING_TYPE_LABEL: Record<SystemSettingType, string> = {
  STR: "String",
  NUM: "Number",
  BOOL: "Boolean",
  RADIO: "Radio",
  SEL: "Select",
  CHECK: "Checkbox",
};

/** 선택지를 갖는 유형 (RADIO·SEL은 하나, CHECK는 여러 개 선택) */
export const CHOICE_TYPES: ReadonlySet<SystemSettingType> = new Set([
  "RADIO",
  "SEL",
  "CHECK",
]);

/** 선택지·체크박스 값 구분자 (system_settings.prop_spr_type) */
export const OPTION_SEPARATOR = ",";

/**
 * 체크박스 값("A,C")을 고른 값 목록으로 나눈다.
 * @param {string} value - 저장 값
 * @returns {string[]}
 */
export function splitMultiValue(value: string) {
  return value ? value.split(OPTION_SEPARATOR) : [];
}

/**
 * 체크박스에서 고른 값을 선택지 순서대로 이어 저장 값으로 만든다.
 * @param {string[]} options - 선택지
 * @param {string[]} selected - 고른 값
 * @returns {string}
 */
export function joinMultiValue(options: string[], selected: string[]) {
  return options
    .filter((option) => selected.includes(option))
    .join(OPTION_SEPARATOR);
}

/**
 * 선택지 하나를 추가할 수 있는지 검사한다.
 * @param {string[]} options - 지금 선택지
 * @param {string} option - 추가할 선택지
 * @returns {string | null} 오류 문구 (문제없으면 null)
 */
export function validateNewOption(options: string[], option: string) {
  if (!option.trim()) return "선택지를 입력하세요.";
  if (option.includes(OPTION_SEPARATOR))
    return "선택지에는 쉼표(,)를 쓸 수 없습니다.";
  if (options.includes(option.trim())) return "이미 있는 선택지입니다.";
  return null;
}

/** 열람 권한 표시명 */
export const SETTING_ACCESS_LABEL: Record<SystemSettingAccess, string> = {
  R: "열람만 가능",
  W: "수정 가능",
  H: "항목 숨김",
};

/** 변경 유형 표시명 */
export const SETTING_ACTION_LABEL: Record<SystemSettingAction, string> = {
  I: "추가",
  U: "수정",
  D: "삭제",
};

/**
 * 설정 값이 유형·선택지에 맞는지 검사한다. 빈 값은 허용한다. (DB check 제약과 같은 규칙)
 * @param {Pick<SystemSetting, "type" | "options">} setting - 유형과 선택지
 * @param {string} value - 검사할 값
 * @returns {string | null} 오류 문구 (문제없으면 null)
 */
export function validateSettingValue(
  setting: Pick<SystemSetting, "type" | "options">,
  value: string,
) {
  if (CHOICE_TYPES.has(setting.type) && !setting.options?.length)
    return "선택지를 하나 이상 추가하세요.";
  if (value === "") return null;
  const options = setting.options ?? [];
  switch (setting.type) {
    case "BOOL":
      return value === "true" || value === "false"
        ? null
        : "true 또는 false만 쓸 수 있습니다.";
    case "NUM":
      return NUMBER_PATTERN.test(value)
        ? null
        : "숫자만 입력할 수 있습니다. (예: 10, 0.85)";
    case "RADIO":
    case "SEL":
      return options.includes(value)
        ? null
        : `${options.join(", ")} 중 하나여야 합니다.`;
    case "CHECK":
      return splitMultiValue(value).every((item) => options.includes(item))
        ? null
        : `${options.join(", ")} 안에서만 고를 수 있습니다.`;
    default:
      return null;
  }
}

/**
 * 상위 그룹 코드를 구한다. 최상위면 null.
 * @param {string} code - 그룹 코드 (예: WM.MAIL_BATCH)
 * @returns {string | null} 예: WM
 */
export function parentCode(code: string) {
  const index = code.lastIndexOf(".");
  return index < 0 ? null : code.slice(0, index);
}

/**
 * 최상위 그룹 코드를 구한다.
 * @param {string} code - 그룹 코드 (예: WM.MAIL_BATCH)
 * @returns {string} 예: WM
 */
export function rootCode(code: string) {
  return code.split(".")[0];
}

/**
 * 설정을 탭(최상위 그룹) 안의 구역(소속 하위 그룹)별로 묶는다. 항목 숨김(H)은 빼고, 검색어로 거른다.
 * 검색어는 속성명·키·설명·값에서 찾는다. 구역은 그룹 코드 순, 설정은 키 순이다.
 * @param {SystemSetting[]} settings - 설정 목록
 * @param {SystemSettingGroup[]} groups - 그룹 목록 (구역 이름용)
 * @param {{ rootId: string, query: string }} filter - 탭과 검색어
 * @returns {{ id: string, name: string, settings: SystemSetting[] }[]}
 */
export function buildSections(
  settings: SystemSetting[],
  groups: SystemSettingGroup[],
  filter: { rootId: string; query: string },
) {
  const query = filter.query.trim().toLowerCase();
  const names = new Map(groups.map((group) => [group.id, group.name]));
  const sections = new Map<string, SystemSetting[]>();

  for (const setting of [...settings].sort((a, b) =>
    a.key.localeCompare(b.key),
  )) {
    if (setting.groupId !== filter.rootId || setting.access === "H") continue;
    const matched =
      !query ||
      [setting.name, setting.key, setting.description, setting.value]
        .filter(Boolean)
        .some((text) => text!.toLowerCase().includes(query));
    if (!matched) continue;
    const sectionId = setting.subGroupId ?? setting.groupId;
    sections.set(sectionId, [...(sections.get(sectionId) ?? []), setting]);
  }

  return [...sections.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, items]) => ({ id, name: names.get(id) ?? id, settings: items }));
}

/**
 * 화면에서 고친 값 중 저장된 값과 다른 것만 저장 요청으로 만든다.
 * @param {SystemSetting[]} settings - 저장된 설정 목록
 * @param {Record<string, string>} drafts - 키별 고친 값
 * @returns {SystemSettingChange[]}
 */
export function diffSettingValues(
  settings: SystemSetting[],
  drafts: Record<string, string>,
): SystemSettingChange[] {
  return settings
    .filter((setting) => setting.key in drafts)
    .filter((setting) => drafts[setting.key] !== (setting.value ?? ""))
    .map((setting) => ({ key: setting.key, value: drafts[setting.key] }));
}

/**
 * 한국 시간 기준 오늘 날짜(YYYY-MM-DD)를 구한다. (변경 이력 조회 일자 기본값)
 * @param {Date} [now] - 기준 시각
 * @returns {string}
 */
export function kstToday(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60_000).toISOString().slice(0, 10);
}

/**
 * 한국 시간 하루(YYYY-MM-DD)를 UTC 시각 범위로 바꾼다. (변경 이력 일자 검색)
 * @param {string} date - 한국 시간 날짜
 * @returns {{ from: string, to: string }} ISO 문자열 [from, to)
 */
export function kstDayRange(date: string) {
  const from = new Date(`${date}T00:00:00+09:00`);
  const to = new Date(from.getTime() + 24 * 60 * 60_000);
  return { from: from.toISOString(), to: to.toISOString() };
}
