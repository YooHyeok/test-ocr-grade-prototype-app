import TableHead from "@/components/table-head";
import type { GradingRecord } from "@/type";
import GradingRow from "./grading-row";

type Props = {
  records: GradingRecord[];
};

const COLUMNS = [
  "채점일",
  "학생",
  "학원 / 클래스",
  "시험 카테고리",
  "시험지",
  "상태",
  "",
];

/**
 * 채점 기록 건수와 목록 표.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function GradingTable({ records }: Readonly<Props>) {
  return (
    <>
      <div className="text-muted-foreground mx-0.5 mt-4 mb-2 flex items-center justify-between text-xs">
        <p>
          총 <strong className="text-foreground">{records.length}</strong>건의
          채점 관리
        </p>
        <button type="button" className="text-[#64716d]">
          최신순 ⌄
        </button>
      </div>

      <div className="bg-card overflow-x-auto rounded-[11px] border max-sm:overflow-visible max-sm:border-0 max-sm:bg-transparent">
        <table className="w-full border-collapse whitespace-nowrap max-sm:block">
          <TableHead columns={COLUMNS} className="max-sm:hidden" />
          <tbody className="text-xs text-[#596660] max-sm:grid max-sm:gap-2.5">
            {records.map((record) => (
              <GradingRow
                key={`${record.date}-${record.student}`}
                record={record}
              />
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <p className="text-muted-foreground p-10 text-center text-sm">
            조건에 맞는 채점 기록이 없습니다.
          </p>
        )}
      </div>
    </>
  );
}
