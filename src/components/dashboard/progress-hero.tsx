import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import MoleculeArt from "./molecule-art";

type Props = {
  completedToday: number;
  needsReview: number;
};

/**
 * 대시보드 상단 오늘의 채점 진행 카드. 우측에 H₂O 분자 일러스트를 표시한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ProgressHero({
  completedToday,
  needsReview,
}: Readonly<Props>) {
  return (
    <article className="bg-mint relative min-h-[222px] overflow-hidden rounded-[18px] px-8 py-7.5 max-sm:min-h-[245px] max-sm:px-5 max-sm:py-6">
      <div className="relative z-10">
        <p className="text-primary mb-2 text-[10px] font-bold tracking-[1.6px]">
          TODAY'S PROGRESS
        </p>
        <h2 className="mb-2 text-[26px] leading-[1.42] font-bold tracking-tight max-sm:text-[23px]">
          오늘 {completedToday}장의 시험지를
          <br />
          <em className="text-primary not-italic">차근차근</em> 정리했어요.
        </h2>
        <p className="mb-4 text-[13px] leading-[1.7] text-[#59716a]">
          OCR이 먼저 읽고, 선생님은 애매한 답만 확인하세요.
          <br />
          현재 검토 대기 시험지는 {needsReview}장입니다.
        </p>
        <Link
          to="/grading"
          className="bg-sidebar inline-flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-bold text-[#f6fbf9]"
        >
          검토 대기 보기 <ArrowRight className="size-4" />
        </Link>
      </div>
      <MoleculeArt />
    </article>
  );
}
