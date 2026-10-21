import { useCurrentMode } from "@/hooks/use-current-mode";

/**
 * 현재 학원과 권한 요약 카드. 선생님 모드에서만 표시한다.
 * TODO: 세션(학원/권한) 연동 전까지 기획 프로토타입의 예시 값을 사용한다.
 * @returns {JSX.Element | null}
 */
export default function AcademyCard() {
  const mode = useCurrentMode();
  if (mode !== "teacher") return null;

  return (
    <div className="mb-3 rounded-[11px] bg-white/7 p-3 text-xs">
      <span className="text-sidebar-primary mb-1.5 block text-[10px] tracking-[1px]">
        현재 학원
      </span>
      <strong className="block">라온 과학학원</strong>
      <span className="text-sidebar-muted mt-1 block text-[11px]">
        전체 권한
      </span>
    </div>
  );
}
