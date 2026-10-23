import { useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { CHOICE_MARKS } from "@/lib/exam-sheet";
import type { ExamSheet, ObjectiveQuestion } from "@/type";

type Props = {
  sheet: ExamSheet;
  questions: ObjectiveQuestion[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * 객관식 시험지 종이 (머리글, 문항별 보기, 정답 표시).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ObjectivePaper({
  sheet,
  questions,
  selectedIndex,
  onSelect,
}: Props) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onSelect(Number(event.currentTarget.value)),
    [onSelect],
  );

  return (
    <>
      <div className="mb-4.5 flex items-end justify-between gap-3.5 border-b-2 border-[#625d54] pb-3.5">
        <div>
          <strong className="text-foreground block text-[17px]">
            {sheet.name}
          </strong>
          <span className="text-xs text-[#8a857c]">
            {sheet.category} · {sheet.subject}
          </span>
        </div>
        <span className="text-xs text-[#8a857c]">이름 ____________</span>
      </div>

      <p className="mb-4.5 text-[13px] text-[#6a655c]">
        다음 문항에서 알맞은 답을 하나 고르세요.
      </p>

      {questions.map((item, index) => (
        <button
          key={index}
          type="button"
          value={index}
          onClick={handleClick}
          className={cn(
            "mb-2.5 block w-full rounded-[9px] border border-[#ece9e1] px-3.5 py-3 text-left hover:border-[#c9d6d0] hover:bg-[#fafbf9]",
            index === selectedIndex &&
              "border-primary bg-[#f2f9f5] shadow-[0_0_0_2px_rgba(29,118,88,.12)]",
          )}
        >
          <div className="text-foreground mb-2 text-sm font-semibold">
            {index + 1}. {item.question}
          </div>
          <div className="grid gap-1.5">
            {item.choices.map((choice, choiceIndex) => (
              <div
                key={choice}
                className={cn(
                  "flex items-center gap-2 rounded-[7px] border border-[#eef0ed] px-2.5 py-1.5 text-[13px] text-[#56635e]",
                  choiceIndex === item.answer &&
                    "border-primary bg-mint-soft text-primary font-bold",
                )}
              >
                <span
                  className={cn(
                    "text-sm text-[#97a09b]",
                    choiceIndex === item.answer && "text-primary",
                  )}
                >
                  {CHOICE_MARKS[choiceIndex]}
                </span>
                <span>{choice}</span>
              </div>
            ))}
          </div>
        </button>
      ))}
    </>
  );
}
