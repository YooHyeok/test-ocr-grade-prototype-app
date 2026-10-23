import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import GradingFilter from "@/components/grading/grading-filter";
import GradingTable from "@/components/grading/grading-table";
import { GRADING_RECORDS } from "@/lib/mock-data";
import { INITIAL_GRADING_FILTER, filterGradingRecords } from "@/lib/grading";

/**
 * 채점 관리 페이지.
 * @returns {JSX.Element}
 */
export default function GradingPage() {
  const [filter, setFilter] = useState(INITIAL_GRADING_FILTER);

  const records = useMemo(
    () => filterGradingRecords(GRADING_RECORDS, filter),
    [filter],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setFilter((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleReset = useCallback(() => setFilter(INITIAL_GRADING_FILTER), []);

  return (
    <>
      <GradingFilter
        value={filter}
        onChange={handleChange}
        onReset={handleReset}
      />
      <GradingTable records={records} />
    </>
  );
}
