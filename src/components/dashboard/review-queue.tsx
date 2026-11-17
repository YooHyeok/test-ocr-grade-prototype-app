import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { GradingRecord } from "@/type";

type Props = {
  records: GradingRecord[];
};

/**
 * 선생님 검토가 필요한 시험지 목록. 누르면 채점 관리로 이동한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ReviewQueue({ records }: Readonly<Props>) {
  return (
    <section className="surface grid content-start gap-3 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-coral-strong">NEEDS REVIEW</p>
          <h3 className="font-bold">검토 대기</h3>
        </div>
        <span className="bg-coral-soft text-coral-strong rounded-full px-2.5 py-1 text-xs font-bold">
          {records.length}장
        </span>
      </div>
      <ul className="grid gap-2">
        {records.map((record) => (
          <li key={`${record.date}-${record.student}`}>
            <Link
              to="/grading"
              className="flex items-center gap-3 rounded-lg border border-[#f3e1db] bg-[#fffaf8] px-3 py-2.5 hover:border-[#e9c3b8]"
            >
              <span className="bg-coral-soft text-coral-strong grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold">
                {record.student[0]}
              </span>
              <span className="grid min-w-0 flex-1">
                <strong className="truncate text-[13px]">
                  {record.student}
                  <span className="text-muted-foreground ml-1.5 text-[11px] font-normal">
                    {record.className}
                  </span>
                </strong>
                <small className="text-muted-foreground truncate text-[11px]">
                  {record.paper} · {record.date}
                </small>
              </span>
              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      {records.length === 0 && (
        <p className="text-muted-foreground py-6 text-center text-sm">
          검토할 시험지가 없습니다.
        </p>
      )}
    </section>
  );
}
