import { memo } from "react";
import type { Student } from "@/type";

type Props = {
  student: Student;
};

/**
 * 학생 카드 하나 (아바타, 이름, 클래스, 최근 채점 상태). 막 가입 승인한 학생은 신규 가입 배지를 단다.
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
        <h3 className="mb-1 text-[15px] font-bold">
          {student.name}
          {student.isNew && (
            <span className="ml-1.5 rounded-full bg-[#fff1cc] px-1.5 py-0.5 align-middle text-[10px] text-[#8a6100]">
              신규 가입
            </span>
          )}
        </h3>
        <p className="text-muted-foreground mb-1 text-xs">
          {student.className}
        </p>
        <small className="text-primary">
          {student.note ??
            (student.needsReview ? "검토 필요 1건" : "최근 채점 완료")}
        </small>
      </div>
      <button type="button" className="text-primary text-xs font-bold">
        상세 보기
      </button>
    </article>
  );
}

export default memo(StudentCard);
