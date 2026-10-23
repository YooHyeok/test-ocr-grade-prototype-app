import type { ChangeEvent } from "react";
import { Search } from "lucide-react";
import {
  GRADING_FILTER_OPTIONS,
  type GradingFilter as Filter,
} from "@/lib/grading";

type Props = {
  value: Filter;
  /** input/select의 name 속성을 필터 키로 사용한다 */
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
};

const SELECTS: {
  name: keyof typeof GRADING_FILTER_OPTIONS;
  allLabel: string;
}[] = [
  { name: "academy", allLabel: "전체 학원" },
  { name: "className", allLabel: "전체 클래스" },
  { name: "category", allLabel: "전체 카테고리" },
  { name: "status", allLabel: "전체 상태" },
];

/**
 * 채점 관리 검색/필터 패널. (검색어, 학원, 클래스, 카테고리, 상태, 채점일 범위)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function GradingFilter({ value, onChange, onReset }: Props) {
  return (
    <div className="bg-card mt-5 grid grid-cols-[minmax(120px,1.2fr)_repeat(4,minmax(0,1fr))_max-content_max-content] gap-2 rounded-[11px] border p-3 max-[1100px]:grid-cols-3 max-sm:grid-cols-1">
      <label className="flex items-center gap-2 rounded-[7px] border px-3 text-[#89938f] max-[1100px]:col-span-2 max-sm:col-auto max-sm:min-h-[38px]">
        <Search className="size-3.5 shrink-0" />
        <input
          type="search"
          name="search"
          value={value.search}
          onChange={onChange}
          placeholder="학생 이름 또는 시험지 검색"
          className="w-full bg-transparent text-xs text-[#52605b] outline-none"
        />
      </label>

      {SELECTS.map(({ name, allLabel }) => (
        <select
          key={name}
          name={name}
          value={value[name]}
          onChange={onChange}
          className="field w-full min-w-0"
        >
          <option value="all">{allLabel}</option>
          {GRADING_FILTER_OPTIONS[name].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ))}

      <div className="flex items-center gap-1.5 text-xs whitespace-nowrap text-[#6b756f] max-[1100px]:col-span-full">
        <span className="font-bold">채점일</span>
        <input
          type="date"
          name="from"
          value={value.from}
          onChange={onChange}
          aria-label="시작일"
          className="field w-[118px] px-2"
        />
        <span>~</span>
        <input
          type="date"
          name="to"
          value={value.to}
          onChange={onChange}
          aria-label="종료일"
          className="field w-[118px] px-2"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="h-[38px] rounded-[7px] border bg-[#f4f6f4] px-3.5 text-xs font-bold whitespace-nowrap text-[#5d6c66] hover:border-[#b7c2bd] hover:bg-[#eef1ee]"
      >
        초기화
      </button>
    </div>
  );
}
