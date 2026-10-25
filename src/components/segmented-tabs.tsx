import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export type TabOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  /** 컨테이너 레이아웃 보정용 (예: 균등 분할 grid) */
  className?: string;
};

/**
 * 회색 바탕 위에 선택된 항목만 흰색으로 떠 보이는 세그먼트 탭.
 * (시험지 보기 전환, 업로드 방식, 이력 기간 구분 등 공용)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: Readonly<Props<T>>) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onChange(event.currentTarget.value as T),
    [onChange],
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-1 rounded-[9px] bg-[#eef1ee] p-1",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          value={option.value}
          aria-selected={option.value === value}
          onClick={handleClick}
          className={cn(
            "rounded-md px-3 py-2 text-xs font-bold text-[#7b8984]",
            option.value === value &&
              "text-primary bg-white shadow-[0_2px_6px_rgba(31,49,43,.08)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
