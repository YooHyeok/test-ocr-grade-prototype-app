import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryBoard from "@/components/groups/category-board";
import TeacherAssignment from "@/components/groups/teacher-assignment";
import {
  CATEGORY_GROUPS,
  TEACHERS,
  TEACHER_ASSIGNMENTS,
} from "@/lib/mock-data";

/**
 * 그룹 관리 페이지.
 * @returns {JSX.Element}
 */
export default function GroupsPage() {
  return (
    <>
      <div className="mt-4 flex justify-end">
        <Button>
          <Plus />
          카테고리 추가
        </Button>
      </div>
      <CategoryBoard groups={CATEGORY_GROUPS} />
      <TeacherAssignment
        assignments={TEACHER_ASSIGNMENTS}
        teachers={TEACHERS}
      />
    </>
  );
}
