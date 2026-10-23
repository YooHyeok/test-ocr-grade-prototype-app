import { Link } from "react-router";
import { Check, CircleAlert } from "lucide-react";

type Props = {
  completedToday: number;
  needsReview: number;
  trend: string;
};

/**
 * 대시보드 우측 통계 카드 (오늘 채점 완료 / 직접 검토 필요).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StatCards({
  completedToday,
  needsReview,
  trend,
}: Props) {
  return (
    <div className="grid gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <article className="bg-card grid grid-cols-[43px_1fr_auto] items-center gap-3 rounded-2xl px-4.5 py-6 shadow-[0_6px_16px_rgba(58,70,64,.035)]">
        <span className="bg-mint-soft text-primary grid size-[42px] place-items-center rounded-[13px]">
          <Check className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground mb-0.5 text-xs">오늘 채점 완료</p>
          <strong className="text-2xl">
            {completedToday}
            <small className="text-xs font-medium"> 장</small>
          </strong>
        </div>
        <span className="text-primary text-[11px] font-bold">{trend}</span>
      </article>

      <article className="bg-card grid grid-cols-[43px_1fr_auto] items-center gap-3 rounded-2xl px-4.5 py-6 shadow-[0_6px_16px_rgba(58,70,64,.035)]">
        <span className="bg-coral-soft text-coral-strong grid size-[42px] place-items-center rounded-[13px]">
          <CircleAlert className="size-5" />
        </span>
        <div>
          <p className="text-muted-foreground mb-0.5 text-xs">직접 검토 필요</p>
          <strong className="text-2xl">
            {needsReview}
            <small className="text-xs font-medium"> 장</small>
          </strong>
        </div>
        <Link
          to="/grading"
          className="self-end text-[11px] font-bold text-[#cc705c]"
        >
          확인하기 →
        </Link>
      </article>
    </div>
  );
}
