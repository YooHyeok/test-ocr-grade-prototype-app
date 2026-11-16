import {
  CHOICE_TYPES,
  GROUP_CODE_PATTERN,
  kstDayRange,
  parentCode,
  validateSettingValue,
} from "@/lib/system-settings";
import {
  BackendError,
  type Profile,
  type SystemSetting,
  type SystemSettingAction,
  type SystemSettingGroup,
  type SystemSettingHistory,
  type SystemSettingInput,
  type SystemSettingsApi,
} from "../types";

/** 데모 저장 데이터 (브라우저 저장소에 통째로 저장) */
type Store = {
  groups: SystemSettingGroup[];
  settings: SystemSetting[];
  histories: SystemSettingHistory[];
};

const STORAGE_KEY = "mock-system-settings-v4";

/** 데모 초기값 (supabase/migrations/…_system_settings.sql의 초기값과 같다) */
const INITIAL_STORE: Store = {
  groups: [
    { id: "WM", name: "쪽지시험", description: "쪽지시험 관리도구 설정" },
    {
      id: "WM.MAIL_BATCH",
      name: "메일 배치",
      description: "채점 결과 메일 자동 발송 설정",
    },
  ],
  settings: [
    {
      id: "seed-mail-batch-cycle",
      key: "WM.MAIL_BATCH.CYCLE",
      groupId: "WM",
      subGroupId: "WM.MAIL_BATCH",
      name: "메일 배치 주기",
      description:
        "DAILY: 매일 전날분 / WEEKLY: 매주 월요일 지난주분 / MONTHLY: 매달 1일 지난달분. 오전 9시 5분(한국 시간) 실행.",
      type: "RADIO",
      value: "MONTHLY",
      options: ["DAILY", "WEEKLY", "MONTHLY"],
      access: "W",
    },
    {
      id: "seed-mail-batch-enabled",
      key: "WM.MAIL_BATCH.ENABLED",
      groupId: "WM",
      subGroupId: "WM.MAIL_BATCH",
      name: "메일 배치 사용 여부",
      description:
        "채점 결과 메일 자동 발송 여부. true면 발송 주기에 맞춰 학원 선생님 전원에게 요약과 CSV를 보낸다.",
      type: "BOOL",
      value: "false",
      options: null,
      access: "W",
    },
  ],
  histories: [],
};

/**
 * 저장된 데모 데이터를 읽는다. 없거나 읽을 수 없으면 초기값.
 * @returns {Store}
 */
function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    // 저장소를 쓸 수 없으면 초기값을 사용한다.
  }
  return structuredClone(INITIAL_STORE);
}

/**
 * 데모 데이터를 저장한다.
 * @param {Store} store - 저장할 데이터
 * @returns {void}
 */
function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // 저장소를 쓸 수 없으면 새로고침 시 초기값으로 돌아간다.
  }
}

/**
 * 값 검사 실패 시 invalid_value 오류를 던진다.
 * @param {Pick<SystemSetting, "type" | "options">} setting - 값 종류와 선택 목록
 * @param {string | null} value - 값
 * @returns {void}
 */
function assertValidValue(
  setting: Pick<SystemSetting, "type" | "options">,
  value: string | null,
) {
  if (!CHOICE_TYPES.has(setting.type) && setting.options)
    throw new BackendError(
      "invalid_value",
      "선택지는 Radio·Select·Checkbox 유형만 가질 수 있습니다.",
    );
  const message = validateSettingValue(setting, value ?? "");
  if (message) throw new BackendError("invalid_value", message);
}

/**
 * 데모 시스템 설정 기능을 만든다. 로그인한 데모 계정이 시스템 관리자일 때만 동작한다.
 * 그룹 계층·키 형식·값 규칙·이력은 DB 제약·트리거와 같게 처리한다.
 * @param {() => Profile | null} getActor - 현재 로그인한 데모 계정 프로필
 * @returns {SystemSettingsApi}
 */
export function createMockSystemSettings(
  getActor: () => Profile | null,
): SystemSettingsApi {
  let store = readStore();

  /** 관리자가 아니면 forbidden 오류, 맞으면 관리자 프로필 */
  const requireAdmin = () => {
    const actor = getActor();
    if (!actor?.isAdmin)
      throw new BackendError(
        "forbidden",
        "시스템 관리자만 접근할 수 있습니다.",
      );
    return actor;
  };

  /** 변경 이력을 남긴다. (DB 트리거와 같은 규칙, 그룹은 최상위 그룹) */
  const log = (
    draft: Store,
    actor: Profile,
    action: SystemSettingAction,
    setting: SystemSetting,
    prevValue: string | null,
  ) => {
    draft.histories.unshift({
      id: crypto.randomUUID(),
      key: setting.key,
      name: setting.name,
      groupId: setting.groupId,
      groupName:
        draft.groups.find((group) => group.id === setting.groupId)?.name ??
        null,
      action,
      prevValue,
      nowValue: action === "D" ? null : setting.value,
      changedAt: new Date().toISOString(),
      changedBy: actor.name,
    });
  };

  /** 변경을 반영하고 저장한다. 검사에 실패하면 아무것도 바꾸지 않는다. */
  const commit = (mutate: (draft: Store) => void) => {
    const draft = structuredClone(store);
    mutate(draft);
    store = draft;
    writeStore(store);
  };

  const findSetting = (draft: Store, key: string) => {
    const setting = draft.settings.find((item) => item.key === key);
    if (!setting)
      throw new BackendError("not_found", `없는 설정입니다: ${key}`);
    return setting;
  };

  const findGroup = (draft: Store, id: string) => {
    const group = draft.groups.find((item) => item.id === id);
    if (!group) throw new BackendError("not_found", `없는 그룹입니다: ${id}`);
    return group;
  };

  return {
    async listGroups() {
      if (!getActor()?.isAdmin) return [];
      return [...store.groups].sort((a, b) => a.id.localeCompare(b.id));
    },

    async createGroup(group) {
      requireAdmin();
      if (!GROUP_CODE_PATTERN.test(group.id))
        throw new BackendError(
          "invalid_value",
          `그룹 코드 형식이 올바르지 않습니다: ${group.id}`,
        );
      if (!group.name.trim())
        throw new BackendError("invalid_value", "그룹명을 입력해주세요.");
      commit((draft) => {
        const parent = parentCode(group.id);
        if (parent && !draft.groups.some((item) => item.id === parent))
          throw new BackendError("in_use", `상위 그룹이 없습니다: ${parent}`);
        if (draft.groups.some((item) => item.id === group.id))
          throw new BackendError(
            "conflict",
            `이미 있는 그룹입니다: ${group.id}`,
          );
        draft.groups.push({ ...group });
      });
    },

    async updateGroup(id, patch) {
      requireAdmin();
      if (!patch.name.trim())
        throw new BackendError("invalid_value", "그룹명을 입력해주세요.");
      commit((draft) => Object.assign(findGroup(draft, id), patch));
    },

    async deleteGroup(id) {
      requireAdmin();
      commit((draft) => {
        findGroup(draft, id);
        const used =
          draft.groups.some((group) => group.id.startsWith(`${id}.`)) ||
          draft.settings.some(
            (setting) => setting.groupId === id || setting.subGroupId === id,
          );
        if (used)
          throw new BackendError(
            "in_use",
            `그룹(${id})에 하위 그룹이나 설정이 남아 있습니다.`,
          );
        draft.groups = draft.groups.filter((group) => group.id !== id);
      });
    },

    async list() {
      if (!getActor()?.isAdmin) return [];
      return [...store.settings].sort((a, b) => a.key.localeCompare(b.key));
    },

    async create(input: SystemSettingInput) {
      const actor = requireAdmin();
      commit((draft) => {
        const owner = input.subGroupId ?? input.groupId;
        if (
          parentCode(input.groupId) !== null ||
          !draft.groups.some((g) => g.id === input.groupId)
        )
          throw new BackendError(
            "invalid_value",
            `없는 최상위 그룹입니다: ${input.groupId}`,
          );
        if (
          input.subGroupId &&
          !draft.groups.some((g) => g.id === input.subGroupId)
        )
          throw new BackendError(
            "invalid_value",
            `없는 그룹입니다: ${input.subGroupId}`,
          );
        if (
          !input.key.startsWith(`${owner}.`) ||
          !GROUP_CODE_PATTERN.test(input.key)
        )
          throw new BackendError(
            "invalid_value",
            `키 형식이 올바르지 않습니다: ${input.key}`,
          );
        if (!input.name.trim())
          throw new BackendError("invalid_value", "속성명을 입력해주세요.");
        assertValidValue(input, input.value);
        if (draft.settings.some((item) => item.key === input.key))
          throw new BackendError(
            "conflict",
            `이미 있는 키입니다: ${input.key}`,
          );
        const setting = {
          ...input,
          value: input.value || null,
          id: crypto.randomUUID().replace(/-/g, ""),
        };
        draft.settings.push(setting);
        log(draft, actor, "I", setting, null);
      });
    },

    async update(key, input) {
      const actor = requireAdmin();
      commit((draft) => {
        const setting = findSetting(draft, key);
        if (!input.name.trim())
          throw new BackendError("invalid_value", "속성명을 입력해주세요.");
        assertValidValue(input, input.value);
        const prevValue = setting.value;
        Object.assign(setting, input, { value: input.value || null });
        if (prevValue !== setting.value)
          log(draft, actor, "U", setting, prevValue);
      });
    },

    async updateValues(changes) {
      const actor = requireAdmin();
      commit((draft) => {
        const updates = changes.map((change) => {
          const setting = findSetting(draft, change.key);
          assertValidValue(setting, change.value);
          return {
            setting,
            prevValue: setting.value,
            value: change.value || null,
          };
        });
        for (const { setting, prevValue, value } of updates) {
          setting.value = value;
          if (prevValue !== value) log(draft, actor, "U", setting, prevValue);
        }
      });
    },

    async remove(key) {
      const actor = requireAdmin();
      commit((draft) => {
        const setting = findSetting(draft, key);
        draft.settings = draft.settings.filter((item) => item.key !== key);
        log(draft, actor, "D", setting, setting.value);
      });
    },

    async listHistories(query) {
      if (!getActor()?.isAdmin) return { items: [], total: 0 };
      const range = query.date ? kstDayRange(query.date) : null;
      const keyword = query.key.trim().toLowerCase();
      const matched = store.histories.filter(
        (history) =>
          (!range ||
            (history.changedAt !== null &&
              history.changedAt >= range.from &&
              history.changedAt < range.to)) &&
          (!query.groupId || history.groupId === query.groupId) &&
          (!keyword || (history.key ?? "").toLowerCase().includes(keyword)),
      );
      const start = (query.page - 1) * query.pageSize;
      return {
        items: matched.slice(start, start + query.pageSize),
        total: matched.length,
      };
    },
  };
}
