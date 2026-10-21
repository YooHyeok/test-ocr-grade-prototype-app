import { useMode } from "@/store/mode";
import { MOBILE_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import type { Mode } from "@/type";

/**
 * 실제 화면에 적용되는 모드를 반환한다. 모바일 폭에서는 항상 학생 모드로 고정한다.
 * @returns {Mode}
 */
export function useCurrentMode(): Mode {
  const mode = useMode();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  return isMobile ? "student" : mode;
}
