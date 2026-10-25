import { memo } from "react";
import type { Student } from "@/type";

type Props = {
  student: Student;
};

/**
 * 학생 카드 하나 (아바타, 이름, 클래스, 최근 채점 상태).
 * TODO: 상세 보기 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
function StudentCard({ student }: Readonly<Props>) {
  return (
    <article className="surface flex items-center gap-3 p-4">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#59776c] text-xs text-white">
        {student.name[0]}
      </span>
      <div className="flex-1">
        <h3 className="mb-1 text-[15px] font-bold">{student.name}</h3>
        <p className="text-muted-foreground mb-1 text-xs">
          {student.className}
        </p>
        <small className="text-primary">
          {student.needsReview ? "검토 필요 1건" : "최근 채점 완료"}
        </small>
      </div>
      <button type="button" className="text-primary text-xs font-bold">
        상세 보기
      </button>
    </article>
  );
}

export default memo(StudentCard);
