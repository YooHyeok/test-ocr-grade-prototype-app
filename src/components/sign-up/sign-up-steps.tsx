import { cn } from "@/lib/utils";

/** 회원가입 단계 (1 기본 정보, 2 본인인증, 3 승인 대기) */
export type SignUpStep = 1 | 2 | 3;

const STEPS = ["기본 정보", "본인인증", "승인 대기"];

type Props = {
  step: SignUpStep;
};

/**
 * 회원가입 진행 단계 표시. 지난 단계는 연한 초록, 지금 단계는 진한 초록.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SignUpSteps({ step }: Readonly<Props>) {
  return (
    <ol aria-label="가입 단계" className="mb-6.5 flex gap-1.5">
      {STEPS.map((label, index) => {
        const number = index + 1;
        const state =
          number === step ? "active" : number < step ? "done" : "todo";
        return (
          <li
            key={label}
            aria-current={state === "active" ? "step" : undefined}
            className={cn(
              "flex flex-1 items-center gap-1.5 border-b-[3px] pb-2.5 text-xs font-bold max-sm:text-[11px]",
              state === "todo" && "border-[#e4e8e4] text-[#a0aaa5]",
              state === "done" && "border-[#9fcfb8] text-[#5c8a76]",
              state === "active" && "border-primary text-primary",
            )}
          >
            <b
              className={cn(
                "grid size-[22px] place-items-center rounded-full text-[11px] text-white",
                state === "todo" && "bg-[#c7cfcb]",
                state === "done" && "bg-[#6fb293]",
                state === "active" && "bg-primary",
              )}
            >
              {number}
            </b>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
