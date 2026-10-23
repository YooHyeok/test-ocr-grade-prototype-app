import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export type CaptureMode = "photo" | "camera";

const TABS: { value: CaptureMode; label: string }[] = [
  { value: "photo", label: "사진 첨부" },
  { value: "camera", label: "실시간 촬영" },
];

type Props = {
  value: CaptureMode;
  onChange: (mode: CaptureMode) => void;
};

/**
 * 업로드 방식 전환 탭 (사진 첨부 / 실시간 촬영).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function CaptureTabs({ value, onChange }: Props) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onChange(event.currentTarget.value as CaptureMode),
    [onChange],
  );

  return (
    <div
      role="tablist"
      className="mt-4.5 grid grid-cols-2 gap-1 rounded-[9px] bg-[#f1f3f1] p-1"
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
            "rounded-md p-2 text-xs font-bold text-[#84908b]",
            tab.value === value &&
              "text-primary bg-white shadow-[0_2px_6px_rgba(31,49,43,.07)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
