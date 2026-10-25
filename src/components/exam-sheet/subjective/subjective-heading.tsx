import type { ExamSheet } from "@/type";

type Props = {
  sheet: ExamSheet;
};

/**
 * 주관식 시험지 머리글. 인쇄 시 자동 분류에 쓰이는 카테고리·과목과 학생 이름 OCR 영역을 표시한다.
 * TODO: 편집 모드에서 카테고리·과목 선택, 이름 영역 크기 조절
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SubjectiveHeading({ sheet }: Readonly<Props>) {
  return (
    <div className="mb-6 flex items-end justify-between gap-3.5 border-b-2 border-[#625d54] pb-4 max-sm:flex-col max-sm:items-start">
      <div className="flex flex-wrap gap-2">
        {[
          ["시험 카테고리", sheet.category],
          ["과목", sheet.subject],
        ].map(([label, value]) => (
          <label key={label} className="grid gap-1 text-[10px] text-[#777168]">
            {label}
            <select
              disabled
              value={value}
              className="h-[31px] min-w-[130px] border border-[#cfd5d2] px-1.5 text-[11px]"
            >
              <option>{value}</option>
            </select>
          </label>
        ))}
      </div>
      {/* 학생 이름 OCR 영역 */}
      <div className="grid min-h-11 w-[170px] content-center gap-0.5 rounded border-2 border-dashed border-[#85b9a5] bg-[#d8efe4]/35 px-2 py-1 text-[11px] font-bold text-[#47836d]">
        이름
        <span className="h-[22px] border border-[#b9cfc7] bg-white" />
      </div>
    </div>
  );
}
