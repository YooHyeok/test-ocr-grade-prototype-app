const ATOM_SHADOW = "shadow-[0_16px_38px_rgba(58,70,64,.08)]";

/**
 * 대시보드 히어로 카드 우측의 H₂O 분자 일러스트 (장식용).
 * @returns {JSX.Element}
 */
export default function MoleculeArt() {
  return (
    <div
      aria-hidden
      className="absolute right-10 bottom-4 h-[170px] w-[180px] max-sm:right-3 max-sm:opacity-35"
    >
      {/* 궤도 */}
      <span className="absolute inset-[15px_9px_24px_11px] -rotate-[28deg] rounded-full border border-dashed border-[#29443b]/25" />
      <span className="absolute inset-[17px_30px_9px_17px] rotate-[28deg] rounded-full border border-dashed border-[#29443b]/25" />
      {/* 결합 */}
      <span className="absolute top-[65px] right-[31px] h-[9px] w-[69px] -rotate-[39deg] rounded-full bg-[#29443b]/25" />
      <span className="absolute bottom-[52px] left-[27px] h-[9px] w-[69px] -rotate-[39deg] rounded-full bg-[#29443b]/25" />
      {/* 원자 */}
      <span
        className={`absolute top-[11px] right-1 z-10 grid size-16 place-items-center rounded-full bg-[#fff7df] text-[22px] font-bold text-[#245143] ${ATOM_SHADOW}`}
      >
        H
      </span>
      <span
        className={`bg-coral absolute top-[65px] left-[65px] z-10 grid size-[82px] place-items-center rounded-full text-[30px] font-bold text-white ${ATOM_SHADOW}`}
      >
        O
      </span>
      <span
        className={`absolute bottom-2 left-[3px] z-10 grid size-16 place-items-center rounded-full bg-[#fff7df] text-[22px] font-bold text-[#245143] ${ATOM_SHADOW}`}
      >
        H
      </span>
    </div>
  );
}
