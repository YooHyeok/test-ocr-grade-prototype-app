import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ObjectiveQuestion as Question } from "@/type";
import ChoiceOption from "./choice-option";

type Props = {
  index: number;
  question: Question;
  selected: boolean;
  onSelect: (index: number) => void;
};

/**
 * 객관식 문항 하나 (질문 + 보기 목록). 클릭하면 좌측 요약 패널에 표시된다.
 * TODO: 보기별 마크 인식 영역(OMR ROI) 표시
 * @param {Props} props
 * @returns {JSX.Element}
 */
function ObjectiveQuestion({
  index,
  question,
  selected,
  onSelect,
}: Readonly<Props>) {
  const handleClick = useCallback(() => onSelect(index), [onSelect, index]);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={handleClick}
      className={cn(
        "mb-2.5 block w-full rounded-[9px] border border-[#ece9e1] px-3.5 py-3 text-left hover:border-[#c9d6d0] hover:bg-[#fafbf9]",
        selected &&
          "border-primary bg-[#f2f9f5] shadow-[0_0_0_2px_rgba(29,118,88,.12)]",
      )}
    >
      <div className="text-foreground mb-2 text-sm font-semibold">
        {index + 1}. {question.question}
      </div>
      <div className="grid gap-1.5">
        {question.choices.map((choice, choiceIndex) => (
          <ChoiceOption
            key={choice}
            index={choiceIndex}
            label={choice}
            correct={choiceIndex === question.answer}
          />
        ))}
      </div>
    </button>
  );
}

export default memo(ObjectiveQuestion);
