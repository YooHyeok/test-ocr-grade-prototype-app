import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

type Props = {
  completedToday: number;
  needsReview: number;
};

/**
 * 대시보드 상단 오늘의 채점 진행 카드. 우측에 H₂O 분자 일러스트를 표시한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ProgressHero({ completedToday, needsReview }: Props) {
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

      {/* H₂O 분자 일러스트 */}
      <div
        aria-hidden
        className="absolute right-10 bottom-4 h-[170px] w-[180px] max-sm:right-3 max-sm:opacity-35"
      >
        <span className="absolute inset-[15px_9px_24px_11px] -rotate-[28deg] rounded-full border border-dashed border-[#29443b]/25" />
        <span className="absolute inset-[17px_30px_9px_17px] rotate-[28deg] rounded-full border border-dashed border-[#29443b]/25" />
        <span className="absolute top-[65px] right-[31px] h-[9px] w-[69px] -rotate-[39deg] rounded-full bg-[#29443b]/25" />
        <span className="absolute bottom-[52px] left-[27px] h-[9px] w-[69px] -rotate-[39deg] rounded-full bg-[#29443b]/25" />
        <span className="absolute top-[11px] right-1 z-10 grid size-16 place-items-center rounded-full bg-[#fff7df] text-[22px] font-bold text-[#245143] shadow-[0_16px_38px_rgba(58,70,64,.08)]">
          H
        </span>
        <span className="bg-coral absolute top-[65px] left-[65px] z-10 grid size-[82px] place-items-center rounded-full text-[30px] font-bold text-white shadow-[0_16px_38px_rgba(58,70,64,.08)]">
          O
        </span>
        <span className="absolute bottom-2 left-[3px] z-10 grid size-16 place-items-center rounded-full bg-[#fff7df] text-[22px] font-bold text-[#245143] shadow-[0_16px_38px_rgba(58,70,64,.08)]">
          H
        </span>
      </div>
    </article>
  );
}
