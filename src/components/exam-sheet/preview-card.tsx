import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** 툴바 우측 버튼 영역 */
  actions?: ReactNode;
  /** 시험지 종이 내용 */
  children: ReactNode;
};

/**
 * 시험지 미리보기 카드. 상단 툴바 + 스크롤 가능한 종이 영역 + 정렬 마커.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PreviewCard({
  title,
  description,
  actions,
  children,
}: Readonly<Props>) {
  return (
    <section className="bg-card flex max-h-[calc(100vh-189px)] min-w-0 flex-col rounded-xl border max-sm:max-h-none">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 max-sm:flex-col max-sm:items-start">
        <div className="grid gap-0.5">
          <strong className="text-sm">{title}</strong>
          <small className="text-muted-foreground text-[11px]">
            {description}
          </small>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {actions}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4 max-sm:p-2.5">
        <div className="border-paper-border relative min-h-[630px] w-full min-w-[520px] border bg-white px-8.5 py-7 text-[13px] text-[#57534b] shadow-[0_4px_12px_rgba(58,70,64,.05)] max-sm:min-h-[560px] max-sm:min-w-[470px] max-sm:px-4 max-sm:py-5">
          {/* 정렬 마커 (fiducial marker): 업로드 사진 원근 보정 기준점 */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {[
              "top-1.5 left-1.5",
              "top-1.5 right-1.5",
              "bottom-1.5 left-1.5",
              "bottom-1.5 right-1.5",
            ].map((position) => (
              <i
                key={position}
                className={`absolute size-4 bg-[#111] shadow-[inset_0_0_0_3px_#fff,inset_0_0_0_5px_#111] ${position}`}
              />
            ))}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
