import { updateSystemSettingValues } from "@/api/system-settings";
import type { MutationCallbacks } from "@/type";
import { useSystemSettingsMutation } from "./use-system-settings-mutation";

/**
 * 시스템 설정 값 일괄 저장 mutation. ([{ key, value }])
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useUpdateSystemSettingValues(callbacks?: MutationCallbacks) {
  return useSystemSettingsMutation(updateSystemSettingValues, callbacks);
}
