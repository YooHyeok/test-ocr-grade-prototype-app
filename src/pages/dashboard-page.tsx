import { useMemo } from "react";
import ClassScores from "@/components/dashboard/class-scores";
import ProgressHero from "@/components/dashboard/progress-hero";
import QuickLinks from "@/components/dashboard/quick-links";
import RecentRecords from "@/components/dashboard/recent-records";
import ReviewQueue from "@/components/dashboard/review-queue";
import StatCards from "@/components/dashboard/stat-cards";
import WeeklyChart from "@/components/dashboard/weekly-chart";
import {
  CLASS_AVERAGES,
  DASHBOARD_SUMMARY,
  GRADING_RECORDS,
  WEEKLY_GRADING,
} from "@/lib/mock-data";

/**
 * 대시보드 페이지. 오늘 진행 상황 → 바로가기 → 이번 주 현황·검토 대기 → 최근 기록·클래스별 평균 순으로 보여준다.
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { completedToday, needsReview, trend } = DASHBOARD_SUMMARY;
  const reviewRecords = useMemo(
    () => GRADING_RECORDS.filter((record) => record.status === "검토 필요"),
    [],
  );
  const recentRecords = useMemo(() => GRADING_RECORDS.slice(0, 5), []);

  return (
    <div className="grid gap-4.5 pb-4">
      <section className="mt-4 grid grid-cols-[1fr_270px] gap-4.5 max-md:grid-cols-1">
        <ProgressHero
          completedToday={completedToday}
          needsReview={needsReview}
        />
        <StatCards
          completedToday={completedToday}
          needsReview={needsReview}
          trend={trend}
        />
      </section>
      <QuickLinks />
      <section className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-4.5 max-[1100px]:grid-cols-1">
        <WeeklyChart data={WEEKLY_GRADING} />
        <ReviewQueue records={reviewRecords} />
      </section>
      <section className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-4.5 max-[1100px]:grid-cols-1">
        <RecentRecords records={recentRecords} />
        <ClassScores classes={CLASS_AVERAGES} />
      </section>
    </div>
  );
}
