import { useCallback, useSyncExternalStore } from "react";

/** 600px 미만: 모바일 (사이드바 숨김, 하단 내비게이션, 학생 모드 고정) */
export const MOBILE_QUERY = "(max-width: 599.98px)";
/** 820px 미만: 태블릿 (사이드바 아이콘 전용) */
export const TABLET_QUERY = "(max-width: 819.98px)";

/**
 * 미디어 쿼리 일치 여부를 구독한다.
 * @param {string} query - CSS 미디어 쿼리
 * @returns {boolean} 현재 일치 여부
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}
