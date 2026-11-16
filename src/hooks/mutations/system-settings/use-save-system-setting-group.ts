import { saveSystemSettingGroup } from "@/api/system-settings";
import type { MutationCallbacks } from "@/type";
import { useSystemSettingsMutation } from "./use-system-settings-mutation";

/**
 * 시스템 설정 그룹 추가·수정 mutation. ({ mode, group })
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useSaveSystemSettingGroup(callbacks?: MutationCallbacks) {
  return useSystemSettingsMutation(saveSystemSettingGroup, callbacks);
}
