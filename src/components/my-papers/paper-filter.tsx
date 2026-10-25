import type { ChangeEvent } from "react";
import SegmentedTabs from "@/components/segmented-tabs";
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
}: Readonly<Props>) {
  return (
    <div className="bg-card mt-4.5 flex items-center gap-2 rounded-[10px] border p-3 max-sm:grid max-sm:grid-cols-2">
      <SegmentedTabs
        options={PERIOD_TABS}
        value={periodType}
        onChange={onPeriodTypeChange}
        ariaLabel="시험지 이력 기간"
        className="max-sm:col-span-full max-sm:grid max-sm:grid-cols-3"
      />
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
