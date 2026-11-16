import { deleteSystemSetting } from "@/api/system-settings";
import type { MutationCallbacks } from "@/type";
import { useSystemSettingsMutation } from "./use-system-settings-mutation";

/**
 * 시스템 설정 삭제 mutation. (설정 키)
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useDeleteSystemSetting(callbacks?: MutationCallbacks) {
  return useSystemSettingsMutation(deleteSystemSetting, callbacks);
}
