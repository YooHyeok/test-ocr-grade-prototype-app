import type { SubjectiveQuestion } from "@/type";

type Props = {
  questions: SubjectiveQuestion[];
};

/**
 * 선택한 시험지의 문항별 기준 답안·허용 표기 목록 (답안만 보기).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function AnswerOverview({ questions }: Props) {
  return (
    <section className="bg-card self-start overflow-hidden rounded-xl border">
      <div className="border-b p-4">
        <h3 className="mb-1 text-[15px] font-bold">시험지별 기준 답안</h3>
        <p className="text-muted-foreground text-xs">
          OCR 영역 설정 없이 문항별 정답과 허용 표기만 빠르게 확인합니다.
        </p>
      </div>
      <div className="grid gap-2 p-4">
        {questions.map((item, index) => (
          <article
            key={index}
            className="grid grid-cols-[46px_minmax(0,1fr)_minmax(150px,220px)] items-center gap-3 rounded-lg border border-[#edf0ee] px-3 py-2.5 max-sm:grid-cols-[46px_1fr]"
          >
            <strong className="text-primary text-xs">{index + 1}번</strong>
            <p className="text-[13px] text-[#56635e]">{item.question}</p>
            <small className="text-[11px] text-[#8c9994] max-sm:col-start-2">
              정답: <b>{item.answer || "미입력"}</b>
              {item.aliases && ` · 허용: ${item.aliases}`}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}
