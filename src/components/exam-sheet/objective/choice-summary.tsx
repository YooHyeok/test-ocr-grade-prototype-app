import { cn } from "@/lib/utils";
import { CHOICE_MARKS } from "@/lib/exam-sheet";
import type { ObjectiveQuestion } from "@/type";

type Props = {
  /** 0부터 시작하는 문항 index */
  index: number;
  question?: ObjectiveQuestion;
};

/**
 * 선택한 객관식 문항의 보기와 정답 요약.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ChoiceSummary({ index, question }: Props) {
  return (
    <aside className="bg-card mt-auto shrink-0 rounded-xl border p-4">
      <p className="text-primary mb-2 text-[10px] font-bold tracking-[1.6px]">
        QUESTION SUMMARY
      </p>
      <h3 className="mb-4 font-bold">{index + 1}번 문항</h3>
      {question && (
        <>
          <p className="text-foreground mb-3 text-[13px] font-semibold">
            {question.question}
          </p>
          <ul className="grid gap-1.5">
            {question.choices.map((choice, choiceIndex) => (
              <li
                key={choice}
                className={cn(
                  "flex items-center gap-2 rounded-[7px] border border-[#e6e9e6] px-2.5 py-1.5 text-[12.5px] text-[#56635e]",
                  choiceIndex === question.answer &&
                    "border-primary bg-mint-soft text-primary font-bold",
                )}
              >
                <span>{CHOICE_MARKS[choiceIndex]}</span>
                <span>{choice}</span>
                {choiceIndex === question.answer && (
                  <em className="bg-primary ml-auto rounded-full px-2 py-px text-[10px] text-white not-italic">
                    정답
                  </em>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
