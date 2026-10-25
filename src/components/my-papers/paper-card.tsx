import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { MyPaper } from "@/type";
import PaperThumb from "./paper-thumb";
import PaperActions from "./paper-actions";

type Props = {
  paper: MyPaper;
};

/**
 * 학생 시험지 이력 카드 하나.
 * TODO: 원본 보기 모달 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
function PaperCard({ paper }: Readonly<Props>) {
  return (
    <article className="surface grid grid-cols-[112px_1fr] gap-4 p-3.5 max-sm:grid-cols-[92px_1fr]">
      <PaperThumb graded={paper.status === "채점 완료"} />
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
        <h3 className="mb-1 pr-21 text-[15px] font-bold">{paper.title}</h3>
        <p className="text-muted-foreground text-xs">
          {paper.uploaded} · <strong>{paper.status}</strong>
        </p>
        <PaperActions status={paper.status} />
      </div>
    </article>
  );
}

export default memo(PaperCard);
