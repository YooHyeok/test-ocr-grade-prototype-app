import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentList from "@/components/students/student-list";
import { STUDENTS } from "@/lib/mock-data";

/**
 * 학생 관리 페이지.
 * @returns {JSX.Element}
 */
export default function StudentsPage() {
  return (
    <>
      <div className="mt-4 flex justify-end">
        <Button>
          <Plus />
          학생 등록
        </Button>
      </div>
      <StudentList students={STUDENTS} />
    </>
  );
}
