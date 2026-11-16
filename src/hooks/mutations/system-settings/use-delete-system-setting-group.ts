import { deleteSystemSettingGroup } from "@/api/system-settings";
import type { MutationCallbacks } from "@/type";
import { useSystemSettingsMutation } from "./use-system-settings-mutation";

/**
 * 시스템 설정 그룹 삭제 mutation. (그룹 아이디)
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useDeleteSystemSettingGroup(callbacks?: MutationCallbacks) {
  return useSystemSettingsMutation(deleteSystemSettingGroup, callbacks);
}
