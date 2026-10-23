import type { Student } from "@/type";

type Props = {
  students: Student[];
};

/**
 * 학생 카드 목록.
 * TODO: 상세 보기 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StudentList({ students }: Props) {
  return (
    <div className="mt-5.5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
      {students.map((student) => (
        <article
          key={student.name}
          className="surface flex items-center gap-3 p-4"
        >
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
      ))}
    </div>
  );
}
