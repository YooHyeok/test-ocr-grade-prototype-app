import { Button } from "@/components/ui/button";
import type { MyPaper } from "@/type";

type Props = {
  /** 현재 페이지에 표시할 시험지 */
  papers: MyPaper[];
  /** 필터 조건에 맞는 전체 건수 */
  total: number;
};

/**
 * 학생 시험지 이력 건수와 카드 목록.
 * 업로드만 된 시험지는 삭제 후 재업로드 / 채점하기, 채점 완료된 시험지는 채점 결과 버튼을 표시한다.
 * TODO: 원본 보기 / 채점 결과 모달, 채점 요청 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PaperList({ papers, total }: Props) {
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
          <article
            key={paper.id}
            className="surface grid grid-cols-[112px_1fr] gap-4 p-3.5 max-sm:grid-cols-[92px_1fr]"
          >
            <div className="relative grid min-h-[142px] place-items-center overflow-hidden rounded-md border border-[#ebe6da] bg-[repeating-linear-gradient(#fffdf8_0_21px,#e8e3d8_22px)] text-[11px] text-[#a29a8b] max-sm:min-h-[126px]">
              <span>시험지</span>
              {paper.status === "채점 완료" && (
                <b className="absolute -rotate-9 text-[22px] text-[#d6483e]">
                  ○ ○ ○
                </b>
              )}
            </div>
            <div className="relative flex flex-col items-start">
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-0 right-0"
              >
                원본 보기
              </Button>
              <span className="bg-mint-soft text-primary mb-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold">
                {paper.category}
              </span>
              <h3 className="mb-1 pr-21 text-[15px] font-bold">
                {paper.title}
              </h3>
              <p className="text-muted-foreground text-xs">
                {paper.uploaded} · <strong>{paper.status}</strong>
              </p>
              <div className="mt-auto flex w-full flex-wrap items-center justify-end gap-1.5 pt-2.5">
                {paper.status === "업로드 완료" ? (
                  <>
                    <Button variant="secondary" size="sm" className="mr-auto">
                      삭제 후 재업로드
                    </Button>
                    <Button size="sm">채점하기</Button>
                  </>
                ) : (
                  <Button size="sm">채점 결과</Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
