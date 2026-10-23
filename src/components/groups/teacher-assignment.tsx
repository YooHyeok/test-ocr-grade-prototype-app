import { Ellipsis, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import type { TeacherAssignment as Assignment } from "@/type";

type Props = {
  assignments: Assignment[];
  teachers: string[];
};

const COLUMNS = ["시험 카테고리", "클래스", "담당 선생님", "역할", ""];

/**
 * 클래스별 담당 선생님 지정 표.
 * TODO: 담당 연결/변경 저장
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function TeacherAssignment({ assignments, teachers }: Props) {
  return (
    <section className="bg-card mt-5.5 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <h3 className="mb-1 text-[15px] font-bold">클래스별 담당 선생님</h3>
          <p className="text-muted-foreground text-xs">
            시험 카테고리와 클래스를 기준으로 담당 선생님을 지정합니다.
          </p>
        </div>
        <Button variant="secondary">
          <Plus />
          담당 연결
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs whitespace-nowrap text-[#596660]">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className="border-b border-[#eef0ee] bg-[#fbfcfa] px-4 py-3.5 text-left text-[11px] font-semibold text-[#86918d]"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => (
              <tr
                key={`${item.category}-${item.className}`}
                className="[&>td]:border-b [&>td]:border-[#eef0ee] [&>td]:px-4 [&>td]:py-3.5 last:[&>td]:border-b-0"
              >
                <td>{item.category}</td>
                <td>{item.className}</td>
                <td>
                  <select
                    defaultValue={item.teacher}
                    className="field min-w-[110px]"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher}>{teacher}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <StatusBadge
                    tone={item.role === "주 담당" ? "done" : "review"}
                  >
                    {item.role}
                  </StatusBadge>
                </td>
                <td>
                  <button
                    type="button"
                    aria-label="더보기"
                    className="text-[#81908b]"
                  >
                    <Ellipsis className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
