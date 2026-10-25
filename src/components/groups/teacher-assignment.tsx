import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TableHead from "@/components/table-head";
import type { TeacherAssignment as Assignment } from "@/type";
import AssignmentRow from "./assignment-row";

type Props = {
  assignments: Assignment[];
  teachers: string[];
};

const COLUMNS = ["시험 카테고리", "클래스", "담당 선생님", "역할", ""];

/**
 * 클래스별 담당 선생님 지정 표.
 * TODO: 담당 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function TeacherAssignment({
  assignments,
  teachers,
}: Readonly<Props>) {
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
          <TableHead columns={COLUMNS} />
          <tbody>
            {assignments.map((assignment) => (
              <AssignmentRow
                key={`${assignment.category}-${assignment.className}`}
                assignment={assignment}
                teachers={teachers}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
