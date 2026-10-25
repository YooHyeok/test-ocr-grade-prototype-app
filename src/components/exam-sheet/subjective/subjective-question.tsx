import { memo, useCallback } from "react";
import type { SubjectiveQuestion as Question } from "@/type";
import AnswerRegion from "./answer-region";

type Props = {
  index: number;
  question: Question;
  selected: boolean;
  onSelect: (index: number) => void;
};

/**
 * 주관식 문항 하나. 질문, 답 작성 영역, 채점 기호(○/✕) 영역으로 구성된다.
 * TODO: 편집 모드에서 질문 수정, 문항 삭제
 * @param {Props} props
 * @returns {JSX.Element}
 */
function SubjectiveQuestion({
  index,
  question,
  selected,
  onSelect,
}: Readonly<Props>) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);

  return (
    <div className="mt-6 grid gap-2">
      <p className="flex gap-1.5 px-2">
        <span>{index + 1}.</span>
        {question.question}
      </p>
      <div className="flex items-center gap-3">
        <AnswerRegion
          region={question.region}
          active={selected}
          onClick={handleSelect}
        >
          {question.answer}
        </AnswerRegion>
        <span
          title="채점 기호가 표시되는 영역"
          className="grid size-[42px] shrink-0 place-items-center rounded-md border-2 border-dashed border-[#d6c3bf] text-[23px] text-[#d9aaa3]"
        >
          ○
        </span>
      </div>
    </div>
  );
}

export default memo(SubjectiveQuestion);
