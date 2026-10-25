import type { MyPaper } from "@/type";
import PaperCard from "./paper-card";

type Props = {
  /** 현재 페이지에 표시할 시험지 */
  papers: MyPaper[];
  /** 필터 조건에 맞는 전체 건수 */
  total: number;
};

/**
 * 학생 시험지 이력 건수와 카드 목록.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PaperList({ papers, total }: Readonly<Props>) {
  return (
    <>
      <p className="text-muted-foreground mx-0.5 mt-4 text-xs">
        총 <strong className="text-foreground">{total}</strong>건의 시험지 이력
      </p>
      <div className="mt-5.5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {papers.length === 0 && (
          <p className="text-muted-foreground bg-card col-span-full rounded-[11px] border border-dashed p-7.5 text-center text-[13px]">
            조건에 맞는 시험지 이력이 없습니다.
          </p>
        )}
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </>
  );
}
