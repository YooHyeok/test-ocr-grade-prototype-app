import { backend } from "@/lib/backend";
import type {
  SystemSettingChange,
  SystemSettingGroup,
  SystemSettingHistoryQuery,
  SystemSettingInput,
} from "@/lib/backend/types";

/*
 * 시스템 설정 (시스템 관리자 전용). 변경 이력은 백엔드가 남긴다.
 * 실제 처리는 설정된 백엔드 구현체(supabase / spring / mock)가 담당한다.
 */

/**
 * 시스템 설정 그룹 목록을 조회한다.
 * @returns {Promise<SystemSettingGroup[]>}
 */
export function fetchSystemSettingGroups() {
  return backend.systemSettings.listGroups();
}

/**
 * 시스템 설정 그룹을 추가하거나(mode=create) 이름·설명을 바꾼다(mode=update).
 * @param {{ mode: "create" | "update", group: SystemSettingGroup }} params
 * @returns {Promise<void>}
 */
export function saveSystemSettingGroup({
  mode,
  group,
}: {
  mode: "create" | "update";
  group: SystemSettingGroup;
}) {
  if (mode === "create") return backend.systemSettings.createGroup(group);
  return backend.systemSettings.updateGroup(group.id, {
    name: group.name,
    description: group.description,
  });
}

/**
 * 시스템 설정 그룹을 삭제한다. (설정이 남아 있으면 in_use 오류)
 * @param {string} id - 그룹 아이디
 * @returns {Promise<void>}
 */
export function deleteSystemSettingGroup(id: string) {
  return backend.systemSettings.deleteGroup(id);
}

/**
 * 시스템 설정 목록을 조회한다.
 * @returns {Promise<import("@/lib/backend/types").SystemSetting[]>}
 */
export function fetchSystemSettings() {
  return backend.systemSettings.list();
}

/**
 * 시스템 설정을 추가하거나(mode=create) 내용을 바꾼다(mode=update, 키·그룹은 그대로).
 * @param {{ mode: "create" | "update", input: SystemSettingInput }} params
 * @returns {Promise<void>}
 */
export function saveSystemSetting({
  mode,
  input,
}: {
  mode: "create" | "update";
  input: SystemSettingInput;
}) {
  if (mode === "create") return backend.systemSettings.create(input);
  return backend.systemSettings.update(input.key, input);
}

/**
 * 여러 시스템 설정의 값을 한 번에 바꾼다.
 * @param {SystemSettingChange[]} changes - 바꿀 설정 키와 값
 * @returns {Promise<void>}
 */
export function updateSystemSettingValues(changes: SystemSettingChange[]) {
  return backend.systemSettings.updateValues(changes);
}

/**
 * 시스템 설정을 삭제한다.
 * @param {string} key - 설정 키
 * @returns {Promise<void>}
 */
export function deleteSystemSetting(key: string) {
  return backend.systemSettings.remove(key);
}

/**
 * 시스템 설정 변경 이력을 검색한다. (최신순 한 페이지)
 * @param {SystemSettingHistoryQuery} query - 조회 일자·그룹·속성키·페이지
 * @returns {Promise<import("@/lib/backend/types").SystemSettingHistoryPage>}
 */
export function fetchSystemSettingHistories(query: SystemSettingHistoryQuery) {
  return backend.systemSettings.listHistories(query);
}
