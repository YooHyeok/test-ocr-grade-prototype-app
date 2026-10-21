import { useMemo } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { MENU, isMenuGroup, type MenuItem } from "@/lib/menu";

/**
 * 모바일 하단 고정 내비게이션. 모바일 폭은 학생 모드 고정이므로 학생 메뉴만 표시한다.
 * `primary` 항목(시험지 첨부)은 가운데 원형 버튼으로 강조한다.
 * @returns {JSX.Element}
 */
export default function MobileNav() {
  const items = useMemo(
    () =>
      MENU.filter((entry) => entry.mode === "student").filter(
        (entry): entry is MenuItem & typeof entry => !isMenuGroup(entry),
      ),
    [],
  );

  return (
    <nav className="bg-card/95 fixed inset-x-0 bottom-0 z-40 grid h-[62px] grid-cols-2 items-end border-t px-2 pt-1.5 pb-[7px] sm:hidden">
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
