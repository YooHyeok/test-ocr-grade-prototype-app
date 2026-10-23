import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import type { ExamSheet, SubjectiveQuestion } from "@/type";

type Props = {
  sheet: ExamSheet;
  questions: SubjectiveQuestion[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * 주관식 시험지 종이 (분류 정보, 이름 OCR 영역, 문항별 답 작성 영역, 채점 기호 영역).
 * TODO: 편집 모드(문항·답안 수정, 영역 크기 조절, 문항 추가/삭제)는 다음 단계에서 문항 단위 컴포넌트로 분리
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SubjectivePaper({
  sheet,
  questions,
  selectedIndex,
  onSelect,
}: Props) {
  const handleRegionClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onSelect(Number(event.currentTarget.value)),
    [onSelect],
  );

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-3.5 border-b-2 border-[#625d54] pb-4 max-sm:flex-col max-sm:items-start">
        <div className="flex flex-wrap gap-2">
          {[
            ["시험 카테고리", sheet.category],
            ["과목", sheet.subject],
          ].map(([label, value]) => (
            <label
              key={label}
              className="grid gap-1 text-[10px] text-[#777168]"
            >
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
        <div className="grid min-h-11 w-[170px] content-center gap-0.5 rounded border-2 border-dashed border-[#85b9a5] bg-[#d8efe4]/35 px-2 py-1 text-[11px] font-bold text-[#47836d]">
          이름
          <span className="h-[22px] border border-[#b9cfc7] bg-white" />
        </div>
      </div>

      <p>다음 문항의 답을 빈칸에 작성하세요.</p>

      {questions.map((item, index) => (
        <div key={index} className="mt-6 grid gap-2">
          <p className="flex gap-1.5 px-2">
            <span>{index + 1}.</span>
            {item.question}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              value={index}
              onClick={handleRegionClick}
              style={{ width: item.region.w, minHeight: item.region.h }}
              className={cn(
                "hover:border-coral flex max-w-[calc(100%-56px)] min-w-40 items-center rounded border-2 border-dashed border-[#85b9a5] bg-[#d8efe4]/35 px-2 text-left text-xs text-[#426c5d]",
                index === selectedIndex &&
                  "border-coral bg-coral/12 text-[#b8604d]",
              )}
            >
              {item.answer}
            </button>
            <span
              title="채점 기호가 표시되는 영역"
              className="grid size-[42px] shrink-0 place-items-center rounded-md border-2 border-dashed border-[#d6c3bf] text-[23px] text-[#d9aaa3]"
            >
              ○
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
