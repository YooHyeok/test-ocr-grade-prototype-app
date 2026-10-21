import { useCallback } from "react";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { useSwitchMode } from "@/hooks/use-switch-mode";
import { tooltipClass } from "./nav-styles";

/**
 * 선생님/학생 모드 전환 원형 버튼. (아이콘 전용 사이드바용)
 * @returns {JSX.Element}
 */
export default function ModeToggle() {
  const mode = useCurrentMode();
  const switchMode = useSwitchMode();

  const nextMode = mode === "student" ? "teacher" : "student";
  const label =
    nextMode === "student" ? "학생 모드로 전환" : "선생님 모드로 전환";

  const handleClick = useCallback(
    () => switchMode(nextMode),
    [switchMode, nextMode],
  );

  return (
    <button
      type="button"
      aria-label={label}
      data-tooltip={label}
      onClick={handleClick}
      className={cn(
        "relative mx-auto mt-2 grid size-[34px] place-items-center rounded-full bg-white/12 hover:bg-white/20",
        tooltipClass,
      )}
    >
      <ArrowLeftRight className="size-4" />
    </button>
  );
}
