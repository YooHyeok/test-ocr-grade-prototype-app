import { Link } from "react-router";
import StatusBadge from "@/components/status-badge";
import type { GradingRecord } from "@/type";

type Props = {
  records: GradingRecord[];
};

/**
 * 최근 채점 기록 (최신 몇 건). 전체 목록은 채점 관리에서 본다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function RecentRecords({ records }: Readonly<Props>) {
  return (
    <section className="surface grid content-start gap-3 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">RECENT</p>
          <h3 className="font-bold">최근 채점 기록</h3>
        </div>
        <Link to="/grading" className="text-primary text-xs font-bold">
          전체 보기 →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="text-left text-[11px] text-[#86918d]">
              <th className="pb-2 font-semibold">채점일</th>
              <th className="pb-2 font-semibold">학생</th>
              <th className="pb-2 font-semibold">시험지</th>
              <th className="pb-2 text-right font-semibold">점수</th>
              <th className="pb-2 text-right font-semibold">상태</th>
            </tr>
          </thead>
          <tbody className="text-[#596660]">
            {records.map((record) => (
              <tr
                key={`${record.date}-${record.student}`}
                className="border-t border-[#eef0ee]"
              >
                <td className="py-2.5 tabular-nums">{record.date}</td>
                <td className="py-2.5">
                  <strong className="text-foreground">{record.student}</strong>
                  <span className="text-muted-foreground ml-1.5">
                    {record.className}
                  </span>
                </td>
                <td className="py-2.5">{record.paper}</td>
                <td className="text-foreground py-2.5 text-right font-bold tabular-nums">
                  {record.score}
                  <span className="text-muted-foreground font-normal">점</span>
                </td>
                <td className="py-2.5 text-right">
                  <StatusBadge
                    tone={record.status === "채점 완료" ? "done" : "review"}
                  >
                    {record.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
