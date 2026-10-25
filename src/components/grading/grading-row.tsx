import { memo } from "react";
import { Ellipsis } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import type { GradingRecord } from "@/type";

type Props = {
  record: GradingRecord;
};

/**
 * 채점 기록 표의 한 행. 모바일에서는 카드 형태로 표시한다.
 * TODO: 행 클릭 시 채점 결과 모달, 더보기(⋯)에서 인쇄 미리보기 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
function GradingRow({ record }: Readonly<Props>) {
  return (
    <tr className="max-sm:bg-card cursor-pointer hover:bg-[#fcfdfb] max-sm:relative max-sm:block max-sm:rounded-[11px] max-sm:border max-sm:p-3.5 [&>td]:border-b [&>td]:border-[#eef0ee] [&>td]:px-4 [&>td]:py-3.5 last:[&>td]:border-b-0 max-sm:[&>td]:block max-sm:[&>td]:border-0 max-sm:[&>td]:p-0.5">
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
        <StatusBadge tone={record.status === "채점 완료" ? "done" : "review"}>
          {record.status}
        </StatusBadge>
      </td>
      <td className="max-sm:absolute max-sm:top-3 max-sm:right-3">
        <button type="button" aria-label="상세 보기" className="text-[#81908b]">
          <Ellipsis className="size-4" />
        </button>
      </td>
    </tr>
  );
}

export default memo(GradingRow);
