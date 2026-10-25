import type { ReactNode } from "react";

type Props = {
  /** 좌측 컬럼 (시험지 목록 + 문항 요약) */
  side: ReactNode;
  /** 우측 본문 (시험지 미리보기 등) */
  children: ReactNode;
};

/**
 * 시험지 관리 화면 공통 2단 레이아웃. 좌측 목록/요약, 우측 미리보기.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SheetWorkspace({ side, children }: Readonly<Props>) {
  return (
    <div className="mt-3 grid grid-cols-[250px_minmax(420px,1fr)] gap-3 max-[1100px]:grid-cols-[180px_1fr] max-sm:grid-cols-1">
      <div className="flex max-h-[calc(100vh-189px)] min-w-0 flex-col gap-3 max-sm:max-h-none">
        {side}
      </div>
      {children}
    </div>
  );
}
