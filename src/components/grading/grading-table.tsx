import { Ellipsis } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import type { GradingRecord } from "@/type";

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
 * 채점 기록 건수와 목록 표. 모바일에서는 행을 카드 형태로 표시한다.
 * TODO: 행 클릭 시 채점 결과(자동/수동 채점) 모달, 인쇄 미리보기 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function GradingTable({ records }: Props) {
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
          <thead className="max-sm:hidden">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className="border-b border-[#eef0ee] bg-[#fbfcfa] px-4 py-3.5 text-left text-[11px] font-semibold tracking-[.2px] text-[#86918d]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs text-[#596660] max-sm:grid max-sm:gap-2.5">
            {records.map((record) => (
              <tr
                key={`${record.date}-${record.student}`}
                className="max-sm:bg-card cursor-pointer hover:bg-[#fcfdfb] max-sm:relative max-sm:block max-sm:rounded-[11px] max-sm:border max-sm:p-3.5 [&>td]:border-b [&>td]:border-[#eef0ee] [&>td]:px-4 [&>td]:py-3.5 last:[&>td]:border-b-0 max-sm:[&>td]:block max-sm:[&>td]:border-0 max-sm:[&>td]:p-0.5"
              >
                <td className="max-sm:text-[11px] max-sm:text-[#98a19e]">
                  {record.date}
                </td>
                <td>
                  <strong className="text-foreground block text-[13px]">
                    {record.student}
                  </strong>
                  <span className="mt-1 block text-[11px] text-[#98a19e]">
                    {record.grade}
                  </span>
                </td>
                <td>
                  {record.academy}
                  <br />
                  {record.className}
                </td>
                <td>{record.category}</td>
                <td>
                  <strong className="text-foreground block text-[13px]">
                    {record.paper}
                  </strong>
                  <span className="mt-1 block text-[11px] text-[#98a19e]">
                    단답형 시험
                  </span>
                </td>
                <td>
                  <StatusBadge
                    tone={record.status === "채점 완료" ? "done" : "review"}
                  >
                    {record.status}
                  </StatusBadge>
                </td>
                <td className="max-sm:absolute max-sm:top-3 max-sm:right-3">
                  <button
                    type="button"
                    aria-label="상세 보기"
                    className="text-[#81908b]"
                  >
                    <Ellipsis className="size-4" />
                  </button>
                </td>
              </tr>
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
