import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Region } from "@/type";

type Props = {
  region: Region;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

/**
 * 학생 답 작성 영역(OCR 인식 영역). 등록된 좌표의 너비·높이로 그린다.
 * TODO: 편집 모드에서 기준 답안 입력, 드래그로 크기 조절
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function AnswerRegion({
  region,
  active,
  onClick,
  children,
}: Readonly<Props>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{ width: region.w, minHeight: region.h }}
      className={cn(
        "hover:border-coral flex max-w-[calc(100%-56px)] min-w-40 items-center rounded border-2 border-dashed border-[#85b9a5] bg-[#d8efe4]/35 px-2 text-left text-xs text-[#426c5d]",
        active && "border-coral bg-coral/12 text-[#b8604d]",
      )}
    >
      {children}
    </button>
  );
}
