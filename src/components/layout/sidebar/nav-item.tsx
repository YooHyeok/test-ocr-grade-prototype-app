import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/lib/menu";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import { navItemVariants } from "./nav-styles";

type Props = {
  item: MenuItem;
  /** 아코디언 그룹의 하위 항목 여부 */
  child?: boolean;
};

/**
 * 사이드바 메뉴 링크. 아이콘 전용 모드에서는 라벨 대신 툴팁으로 표시한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function NavItem({ item, child = false }: Readonly<Props>) {
  const compact = useSidebarCompact();
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end
      data-tooltip={item.label}
      aria-label={compact ? item.label : undefined}
      className={({ isActive }) =>
        cn(navItemVariants({ active: isActive, compact, child }))
      }
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      {!compact && item.label}
    </NavLink>
  );
}
