import { useQuery } from "@tanstack/react-query";
import { fetchSystemSettingGroups } from "@/api/system-settings";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * 시스템 설정 그룹 목록을 조회한다. (시스템 관리자 전용)
 * @returns {import("@tanstack/react-query").UseQueryResult<import("@/lib/backend/types").SystemSettingGroup[]>}
 */
export function useSystemSettingGroupsData() {
  return useQuery({
    queryKey: QUERY_KEYS.systemSettings.groups,
    queryFn: fetchSystemSettingGroups,
  });
}
