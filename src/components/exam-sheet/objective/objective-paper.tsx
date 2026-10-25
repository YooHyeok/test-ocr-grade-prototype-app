import type { ExamSheet, ObjectiveQuestion as Question } from "@/type";
import ObjectiveHeading from "./objective-heading";
import ObjectiveQuestion from "./objective-question";

type Props = {
  sheet: ExamSheet;
  questions: Question[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * 객관식 시험지 종이 (머리글 + 안내 문구 + 문항 목록).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ObjectivePaper({
  sheet,
  questions,
  selectedIndex,
  onSelect,
}: Readonly<Props>) {
  return (
    <>
      <ObjectiveHeading sheet={sheet} />
      <p className="mb-4.5 text-[13px] text-[#6a655c]">
        다음 문항에서 알맞은 답을 하나 고르세요.
      </p>
      {questions.map((question, index) => (
        <ObjectiveQuestion
          key={question.id}
          index={index}
          question={question}
          selected={index === selectedIndex}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
