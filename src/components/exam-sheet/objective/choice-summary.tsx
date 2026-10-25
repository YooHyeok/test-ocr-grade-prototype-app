import type { ObjectiveQuestion } from "@/type";
import ChoiceOption from "./choice-option";

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
export default function ChoiceSummary({ index, question }: Readonly<Props>) {
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
          <div className="grid gap-1.5">
            {question.choices.map((choice, choiceIndex) => (
              <ChoiceOption
                key={choice}
                index={choiceIndex}
                label={choice}
                correct={choiceIndex === question.answer}
                showBadge
              />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
