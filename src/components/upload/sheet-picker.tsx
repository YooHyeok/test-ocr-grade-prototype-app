import { SUBJECTIVE_SHEETS } from "@/lib/mock-data";

const CATEGORIES = [
  ...new Set(SUBJECTIVE_SHEETS.map((sheet) => sheet.category)),
];

/**
 * 업로드할 시험지의 카테고리와 시험지 선택.
 * TODO: 카테고리 선택에 따라 시험지 목록 필터링, 폼 상태 연결
 * @returns {JSX.Element}
 */
export default function SheetPicker() {
  return (
    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
      <label className="grid gap-1.5 text-xs font-bold text-[#68746f]">
        시험 카테고리
        <select className="field w-full">
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-bold text-[#68746f]">
        시험지
        <select className="field w-full">
          {SUBJECTIVE_SHEETS.map((sheet) => (
            <option key={sheet.id}>{sheet.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
