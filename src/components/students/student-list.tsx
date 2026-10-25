import type { Student } from "@/type";
import StudentCard from "./student-card";

type Props = {
  students: Student[];
};

/**
 * 학생 카드 목록.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StudentList({ students }: Readonly<Props>) {
  return (
    <div className="mt-5.5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
      {students.map((student) => (
        <StudentCard key={student.name} student={student} />
      ))}
    </div>
  );
}
