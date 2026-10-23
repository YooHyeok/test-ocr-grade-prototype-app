import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export type SheetView = "editor" | "answers";

const TABS: { value: SheetView; label: string }[] = [
  { value: "editor", label: "양식 편집" },
  { value: "answers", label: "답안만 보기" },
];

type Props = {
  value: SheetView;
  onChange: (view: SheetView) => void;
};

/**
 * 주관식 시험지 관리 보기 전환 탭 (양식 편집 / 답안만 보기).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SheetViewTabs({ value, onChange }: Props) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onChange(event.currentTarget.value as SheetView),
    [onChange],
  );

  return (
    <div
      role="tablist"
      aria-label="시험지 관리 보기"
      className="inline-flex gap-1 rounded-[9px] bg-[#e9eeeb] p-1"
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          value={tab.value}
          aria-selected={tab.value === value}
          onClick={handleClick}
          className={cn(
            "rounded-md px-3 py-2 text-xs font-bold text-[#7b8984]",
            tab.value === value &&
              "text-primary bg-white shadow-[0_2px_6px_rgba(31,49,43,.08)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
