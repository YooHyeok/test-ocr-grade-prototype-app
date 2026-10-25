import { Button } from "@/components/ui/button";
import type { PaperStatus } from "@/type";

type Props = {
  status: PaperStatus;
};

/**
 * 시험지 카드 하단 버튼.
 * 업로드만 된 시험지는 삭제 후 재업로드 / 채점하기, 채점 완료된 시험지는 채점 결과를 표시한다.
 * (채점이 시작된 뒤에는 원본 교체 금지 — PRODUCT_PLAN §3 학생 계정 흐름)
 * TODO: 채점 요청, 채점 결과 모달 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PaperActions({ status }: Readonly<Props>) {
  return (
    <div className="mt-auto flex w-full flex-wrap items-center justify-end gap-1.5 pt-2.5">
      {status === "업로드 완료" ? (
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
  );
}
