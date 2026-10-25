import { cn } from "@/lib/utils";
import { CHOICE_MARKS } from "@/lib/exam-sheet";

type Props = {
  /** 0부터 시작하는 보기 index */
  index: number;
  label: string;
  correct: boolean;
  /** 정답 보기에 "정답" 배지를 붙일지 여부 (요약 패널용) */
  showBadge?: boolean;
};

/**
 * 객관식 보기 하나. 정답 보기는 초록색으로 강조한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ChoiceOption({
  index,
  label,
  correct,
  showBadge = false,
}: Readonly<Props>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[7px] border border-[#e9ece8] px-2.5 py-1.5 text-[13px] text-[#56635e]",
        correct && "border-primary bg-mint-soft text-primary font-bold",
      )}
    >
      <span className={cn("text-sm text-[#97a09b]", correct && "text-primary")}>
        {CHOICE_MARKS[index]}
      </span>
      <span>{label}</span>
      {showBadge && correct && (
        <em className="bg-primary ml-auto rounded-full px-2 py-px text-[10px] text-white not-italic">
          정답
        </em>
      )}
    </div>
  );
}
