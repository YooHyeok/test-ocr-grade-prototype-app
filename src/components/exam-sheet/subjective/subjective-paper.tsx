import type { ExamSheet, SubjectiveQuestion as Question } from "@/type";
import SubjectiveHeading from "./subjective-heading";
import SubjectiveQuestion from "./subjective-question";

type Props = {
  sheet: ExamSheet;
  questions: Question[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/**
 * 주관식 시험지 종이 (머리글 + 안내 문구 + 문항 목록).
 * TODO: 편집 모드 — 하단 "문항 추가"
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SubjectivePaper({
  sheet,
  questions,
  selectedIndex,
  onSelect,
}: Readonly<Props>) {
  return (
    <>
      <SubjectiveHeading sheet={sheet} />
      <p>다음 문항의 답을 빈칸에 작성하세요.</p>
      {questions.map((question, index) => (
        <SubjectiveQuestion
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
