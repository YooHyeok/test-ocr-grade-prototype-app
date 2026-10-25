import { memo } from "react";
import { Ellipsis } from "lucide-react";
import StatusBadge from "@/components/status-badge";
import type { TeacherAssignment } from "@/type";

type Props = {
  assignment: TeacherAssignment;
  teachers: string[];
};

/**
 * 담당 선생님 표의 한 행 (카테고리, 클래스, 담당 선생님 선택, 역할).
 * TODO: 담당 선생님 변경 저장, 더보기 메뉴
 * @param {Props} props
 * @returns {JSX.Element}
 */
function AssignmentRow({ assignment, teachers }: Readonly<Props>) {
  return (
    <tr className="[&>td]:border-b [&>td]:border-[#eef0ee] [&>td]:px-4 [&>td]:py-3.5 last:[&>td]:border-b-0">
      <td>{assignment.category}</td>
      <td>{assignment.className}</td>
      <td>
        <select
          defaultValue={assignment.teacher}
          className="field min-w-[110px]"
        >
          {teachers.map((teacher) => (
            <option key={teacher}>{teacher}</option>
          ))}
        </select>
      </td>
      <td>
        <StatusBadge tone={assignment.role === "주 담당" ? "done" : "review"}>
          {assignment.role}
        </StatusBadge>
      </td>
      <td>
        <button type="button" aria-label="더보기" className="text-[#81908b]">
          <Ellipsis className="size-4" />
        </button>
      </td>
    </tr>
  );
}

export default memo(AssignmentRow);
