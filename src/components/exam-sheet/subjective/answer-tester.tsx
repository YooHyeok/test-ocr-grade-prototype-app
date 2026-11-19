import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import {
  JUDGE_REASON_LABEL,
  JUDGE_VERDICT_LABEL,
  judgeAnswer,
  parseAliases,
} from "@shared/answer-judge.ts";
import { cn } from "@/lib/utils";

type Props = {
  /** 기준 정답 */
  answer: string;
  /** 허용 표기 (쉼표로 구분) */
  aliases: string;
};

const VERDICT_TONE = {
  correct: "bg-mint-soft text-primary",
  incorrect: "bg-coral-soft text-coral-strong",
  review: "bg-[#fff1cc] text-[#8a6100]",
} as const;

/**
 * 문항 판정 테스트. 학생 답 예시를 넣으면 채점 엔진이 어떻게 판정하는지 바로 보여준다.
 * (허용 표기를 정할 때 확인용, 저장하지 않음)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function AnswerTester({ answer, aliases }: Readonly<Props>) {
  const [sample, setSample] = useState("");
  const result = useMemo(
    () =>
      sample.trim()
        ? judgeAnswer({
            ocrText: sample,
            answer,
            aliases: parseAliases(aliases),
          })
        : null,
    [aliases, answer, sample],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSample(event.target.value),
    [],
  );

  return (
    <div className="mt-3 grid gap-1.5 rounded-lg border border-dashed border-[#cfdcd6] bg-[#fafcfb] p-2.5">
      <label className="grid gap-1 text-[11px] font-bold text-[#68746f]">
        판정 테스트
        <input
          id="answer-tester-sample"
          value={sample}
          onChange={handleChange}
          placeholder="학생 답 예시 입력 (예: H₂O, 산화 반응)"
          className="field h-9 w-full min-w-0 rounded-md"
        />
      </label>
      {result ? (
        <div className="grid gap-1 text-[11px]" aria-live="polite">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-bold",
                VERDICT_TONE[result.verdict],
              )}
            >
              {JUDGE_VERDICT_LABEL[result.verdict]}
            </span>
            <span className="text-[#56635e]">
              {JUDGE_REASON_LABEL[result.reason]}
            </span>
          </div>
          <p className="text-[#87938f]">
            정규화:{" "}
            <code className="text-[#3c4943]">
              {result.normalized || "(없음)"}
            </code>
            {result.matched && (
              <>
                {" · "}기준:{" "}
                <code className="text-[#3c4943]">{result.matched}</code>
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-[#9aa5a0]">
          정답 {answer ? `"${answer}"` : "(미입력)"}과 허용 표기 기준으로
          판정합니다.
        </p>
      )}
    </div>
  );
}
