import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchSystemSettingHistories } from "@/api/system-settings";
import type { SystemSettingHistoryQuery } from "@/lib/backend/types";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * 시스템 설정 변경 이력을 검색한다. enabled가 false면 요청하지 않는다. (이력 탭을 열 때만 조회)
 * 페이지를 넘기는 동안에는 이전 결과를 보여준다.
 * @param {SystemSettingHistoryQuery} query - 조회 일자·그룹·속성키·페이지
 * @param {boolean} enabled - 조회 여부
 * @returns {import("@tanstack/react-query").UseQueryResult<import("@/lib/backend/types").SystemSettingHistoryPage>}
 */
export function useSystemSettingHistoriesData(
  query: SystemSettingHistoryQuery,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.systemSettings.histories(query),
    queryFn: () => fetchSystemSettingHistories(query),
    enabled,
    placeholderData: keepPreviousData,
  });
}
