import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import PaperFilter from "@/components/my-papers/paper-filter";
import PaperList from "@/components/my-papers/paper-list";
import Pagination from "@/components/pagination";
import { MY_PAPERS } from "@/lib/mock-data";
import {
  PAPERS_PER_PAGE,
  buildPeriodOptions,
  filterPapers,
  type PeriodType,
} from "@/lib/paper-history";

/**
 * 내 시험지(학생 시험지 이력) 페이지.
 * @returns {JSX.Element}
 */
export default function MyPapersPage() {
  const [periodType, setPeriodType] = useState<PeriodType>("all");
  const [period, setPeriod] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const periodOptions = useMemo(
    () => buildPeriodOptions(MY_PAPERS, periodType),
    [periodType],
  );
  const filtered = useMemo(
    () => filterPapers(MY_PAPERS, { periodType, period, status }),
    [periodType, period, status],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAPERS_PER_PAGE));
  const visible = useMemo(
    () => filtered.slice((page - 1) * PAPERS_PER_PAGE, page * PAPERS_PER_PAGE),
    [filtered, page],
  );

  const handlePeriodTypeChange = useCallback((type: PeriodType) => {
    setPeriodType(type);
    setPeriod("all");
    setPage(1);
  }, []);

  const handlePeriodChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setPeriod(event.target.value);
      setPage(1);
    },
    [],
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setStatus(event.target.value);
      setPage(1);
    },
    [],
  );

  return (
    <>
      <div className="border-notice-border bg-notice text-notice-foreground mt-4.5 rounded-[10px] border px-4 py-3.5 text-[13px]">
        시험지를 올리는 것만으로는 채점되지 않습니다. 사진을 확인한 뒤{" "}
        <strong>채점하기</strong>를 눌러주세요.
      </div>
      <PaperFilter
        periodType={periodType}
        period={period}
        status={status}
        periodOptions={periodOptions}
        onPeriodTypeChange={handlePeriodTypeChange}
        onPeriodChange={handlePeriodChange}
        onStatusChange={handleStatusChange}
      />
      <PaperList papers={visible} total={filtered.length} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
