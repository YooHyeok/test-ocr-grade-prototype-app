import { useMemo } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { MENU, isMenuGroup, type MenuItem } from "@/lib/menu";
import { useCurrentMode } from "@/hooks/use-current-mode";

/**
 * 모바일 하단 고정 내비게이션. 계정 모드의 메뉴 중 하위 메뉴가 없는 항목만 표시한다.
 * `primary` 항목(시험지 첨부)은 가운데 원형 버튼으로 강조한다.
 * @returns {JSX.Element}
 */
export default function MobileNav() {
  const mode = useCurrentMode();
  const items = useMemo(
    () =>
      MENU.filter((entry) => entry.mode === mode).filter(
        (entry): entry is MenuItem & typeof entry => !isMenuGroup(entry),
      ),
    [mode],
  );

  return (
    <nav
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      className="bg-card/95 fixed inset-x-0 bottom-0 z-40 grid h-[62px] items-end border-t px-2 pt-1.5 pb-[7px] sm:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                "text-muted-foreground grid place-items-center gap-0.5 text-[10px]",
                (isActive || item.primary) && "text-primary",
                item.primary && "font-bold",
              )
            }
          >
            {Icon &&
              (item.primary ? (
                <span className="bg-primary text-primary-foreground -mt-5 grid size-9 place-items-center rounded-full shadow-[0_5px_14px_rgba(29,118,88,.3)]">
                  <Icon className="size-5" />
                </span>
              ) : (
                <Icon className="size-[17px]" />
              ))}
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
