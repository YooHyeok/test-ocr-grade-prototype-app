import { useIsSidebarCollapsed } from "@/store/sidebar";
import { TABLET_QUERY, useMediaQuery } from "@/hooks/use-media-query";

/**
 * 사이드바를 아이콘 전용(좁은 폭)으로 그려야 하는지 반환한다.
 * 사용자가 접었거나, 태블릿 폭이면 true.
 * @returns {boolean}
 */
export function useSidebarCompact() {
  const isCollapsed = useIsSidebarCollapsed();
  const isTablet = useMediaQuery(TABLET_QUERY);
  return isCollapsed || isTablet;
}
