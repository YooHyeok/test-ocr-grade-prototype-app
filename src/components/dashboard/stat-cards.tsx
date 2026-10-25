import { Link } from "react-router";
import { Check, CircleAlert } from "lucide-react";
import StatCard from "./stat-card";

type Props = {
  completedToday: number;
  needsReview: number;
  trend: string;
};

/**
 * 대시보드 우측 통계 카드 묶음 (오늘 채점 완료 / 직접 검토 필요).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StatCards({
  completedToday,
  needsReview,
  trend,
}: Readonly<Props>) {
  return (
    <div className="grid gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <StatCard
        icon={Check}
        tone="green"
        label="오늘 채점 완료"
        value={completedToday}
        unit="장"
        extra={
          <span className="text-primary text-[11px] font-bold">{trend}</span>
        }
      />
      <StatCard
        icon={CircleAlert}
        tone="coral"
        label="직접 검토 필요"
        value={needsReview}
        unit="장"
        extra={
          <Link
            to="/grading"
            className="self-end text-[11px] font-bold text-[#cc705c]"
          >
            확인하기 →
          </Link>
        }
      />
    </div>
  );
}
