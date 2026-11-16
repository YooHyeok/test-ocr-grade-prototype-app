import { saveSystemSetting } from "@/api/system-settings";
import type { MutationCallbacks } from "@/type";
import { useSystemSettingsMutation } from "./use-system-settings-mutation";

/**
 * 시스템 설정 추가·수정 mutation. ({ mode, input })
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useSaveSystemSetting(callbacks?: MutationCallbacks) {
  return useSystemSettingsMutation(saveSystemSetting, callbacks);
}
