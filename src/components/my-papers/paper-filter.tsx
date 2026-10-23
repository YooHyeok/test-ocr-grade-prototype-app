import { useCallback, type ChangeEvent, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  PAPER_STATUS_OPTIONS,
  PERIOD_TABS,
  type PeriodType,
} from "@/lib/paper-history";

type Props = {
  periodType: PeriodType;
  period: string;
  status: string;
  periodOptions: { value: string; label: string }[];
  onPeriodTypeChange: (type: PeriodType) => void;
  onPeriodChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onStatusChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

/**
 * 시험지 이력 필터 (기간 구분 탭, 상세 기간, 채점 상태).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PaperFilter({
  periodType,
  period,
  status,
  periodOptions,
  onPeriodTypeChange,
  onPeriodChange,
  onStatusChange,
}: Props) {
  const handleTabClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onPeriodTypeChange(event.currentTarget.value as PeriodType),
    [onPeriodTypeChange],
  );

  return (
    <div className="bg-card mt-4.5 flex items-center gap-2 rounded-[10px] border p-3 max-sm:grid max-sm:grid-cols-2">
      <div
        role="tablist"
        aria-label="시험지 이력 기간"
        className="flex gap-1 rounded-lg bg-[#f1f3f1] p-[3px] max-sm:col-span-full max-sm:grid max-sm:grid-cols-3"
      >
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            value={tab.value}
            aria-selected={tab.value === periodType}
            onClick={handleTabClick}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-bold text-[#84908b]",
              tab.value === periodType &&
                "text-primary bg-white shadow-[0_2px_6px_rgba(31,49,43,.07)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <select
        value={period}
        onChange={onPeriodChange}
        aria-label="이력 기간 상세 선택"
        className="field min-w-[130px] max-sm:min-w-0"
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={onStatusChange}
        aria-label="채점 상태 선택"
        className="field min-w-[130px] max-sm:min-w-0"
      >
        <option value="all">전체 상태</option>
        {PAPER_STATUS_OPTIONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
