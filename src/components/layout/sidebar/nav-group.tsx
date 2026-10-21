import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuGroup } from "@/lib/menu";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import NavItem from "./nav-item";
import { navItemVariants } from "./nav-styles";

type Props = {
  group: MenuGroup;
};

/**
 * 하위 메뉴를 가진 아코디언 메뉴.
 * 하위 화면에 있으면 자동으로 펼치고, 아이콘 전용 모드에서는 첫 하위 화면으로 바로 이동한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function NavGroup({ group }: Props) {
  const compact = useSidebarCompact();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isInGroup = useMemo(
    () => group.children.some((item) => item.to === pathname),
    [group.children, pathname],
  );
  const [isOpen, setIsOpen] = useState(isInGroup);

  // 그룹 밖으로 이동하면 접고, 하위 화면으로 들어오면 펼친다 (프로토타입 동작과 동일)
  useEffect(() => {
    setIsOpen(isInGroup);
  }, [isInGroup]);

  const handleClick = useCallback(() => {
    if (compact) {
      navigate(group.children[0].to);
      return;
    }
    setIsOpen((prev) => !prev);
  }, [compact, navigate, group.children]);

  const Icon = group.icon;

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        data-tooltip={group.label}
        aria-label={compact ? group.label : undefined}
        aria-expanded={isOpen}
        onClick={handleClick}
        className={cn(navItemVariants({ active: isInGroup, compact }))}
      >
        <Icon className="size-4 shrink-0" />
        {!compact && (
          <>
            {group.label}
            <ChevronDown
              className={cn(
                "ml-auto size-4 opacity-65 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </>
        )}
      </button>
      {!compact && isOpen && (
        <div className="border-sidebar-border my-0.5 ml-[11px] grid gap-0.5 border-l pl-[19px]">
          {group.children.map((item) => (
            <NavItem key={item.to} item={item} child />
          ))}
        </div>
      )}
    </div>
  );
}
