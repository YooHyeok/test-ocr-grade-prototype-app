import ProgressHero from "@/components/dashboard/progress-hero";
import StatCards from "@/components/dashboard/stat-cards";
import QuickLinks from "@/components/dashboard/quick-links";
import { DASHBOARD_SUMMARY } from "@/lib/mock-data";

/**
 * 대시보드 페이지.
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const { completedToday, needsReview, trend } = DASHBOARD_SUMMARY;

  return (
    <>
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
    </>
  );
}
