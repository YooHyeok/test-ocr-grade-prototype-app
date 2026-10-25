type Props = {
  graded: boolean;
};

/**
 * 시험지 썸네일. 채점 완료된 시험지는 빨간 채점 표시를 겹쳐 보여준다.
 * TODO: 업로드한 사진(Storage) 썸네일로 교체
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PaperThumb({ graded }: Readonly<Props>) {
  return (
    <div className="relative grid min-h-[142px] place-items-center overflow-hidden rounded-md border border-[#ebe6da] bg-[repeating-linear-gradient(#fffdf8_0_21px,#e8e3d8_22px)] text-[11px] text-[#a29a8b] max-sm:min-h-[126px]">
      <span>시험지</span>
      {graded && (
        <b className="absolute -rotate-9 text-[22px] text-[#d6483e]">○ ○ ○</b>
      )}
    </div>
  );
}
