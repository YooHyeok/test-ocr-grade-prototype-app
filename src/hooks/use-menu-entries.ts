import { useMemo } from "react";
import { MENU, isMenuGroup, type MenuEntry, type MenuItem } from "@/lib/menu";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { useCurrentProfile } from "@/hooks/use-current-profile";

/**
 * 현재 계정에 보여줄 메뉴 목록. 모드(선생님/학생)에 맞는 메뉴만 남기고,
 * 관리자 전용 메뉴(하위 메뉴 포함)는 시스템 관리자에게만 보인다. 하위 메뉴가 모두 빠진 그룹은 숨긴다.
 * @returns {MenuEntry[]}
 */
export function useMenuEntries() {
  const mode = useCurrentMode();
  const isAdmin = useCurrentProfile()?.isAdmin ?? false;
  return useMemo(() => {
    const visible = (item: MenuItem) => !item.adminOnly || isAdmin;
    return MENU.filter((entry) => entry.mode === mode).flatMap(
      (entry): MenuEntry[] => {
        if (!isMenuGroup(entry)) return visible(entry) ? [entry] : [];
        const children = entry.children.filter(visible);
        return children.length > 0 ? [{ ...entry, children }] : [];
      },
    );
  }, [mode, isAdmin]);
}
