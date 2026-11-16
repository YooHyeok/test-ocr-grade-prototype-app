import { useQuery } from "@tanstack/react-query";
import { fetchSystemSettings } from "@/api/system-settings";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * 시스템 설정 목록을 조회한다. (시스템 관리자 전용)
 * @returns {import("@tanstack/react-query").UseQueryResult<import("@/lib/backend/types").SystemSetting[]>}
 */
export function useSystemSettingsData() {
  return useQuery({
    queryKey: QUERY_KEYS.systemSettings.list,
    queryFn: fetchSystemSettings,
  });
}
