import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/type";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { useSwitchMode } from "@/hooks/use-switch-mode";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "teacher", label: "선생님 모드" },
  { value: "student", label: "학생 모드" },
];

/**
 * 선생님/학생 모드 전환 세그먼트 버튼. (펼친 사이드바용)
 * @returns {JSX.Element}
 */
export default function ModeSwitch() {
  const mode = useCurrentMode();
  const switchMode = useSwitchMode();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      switchMode(event.currentTarget.value as Mode),
    [switchMode],
  );

  return (
    <div
      role="group"
      aria-label="화면 모드 전환"
      className="mt-3 grid grid-cols-2 gap-1 rounded-[9px] bg-white/7 p-1"
    >
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          value={option.value}
          aria-pressed={mode === option.value}
          onClick={handleClick}
          className={cn(
            "text-sidebar-muted rounded-md px-0.5 py-2 text-[11px] font-bold",
            mode === option.value &&
              "bg-sidebar-primary text-sidebar-primary-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
