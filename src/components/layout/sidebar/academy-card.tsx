import { useCurrentProfile } from "@/hooks/use-current-profile";

/**
 * 소속 학원 요약 카드. 선생님 계정에만 표시한다.
 * 학원이 지정되지 않은 계정은 관리자에게 배정을 요청하도록 안내한다.
 * @returns {JSX.Element | null}
 */
export default function AcademyCard() {
  const profile = useCurrentProfile();
  if (profile?.role !== "teacher") return null;

  return (
    <div className="mb-3 rounded-[11px] bg-white/7 p-3 text-xs">
      <span className="text-sidebar-primary mb-1.5 block text-[10px] tracking-[1px]">
        현재 학원
      </span>
      <strong className="block">
        {profile.academyName ?? "소속 학원 없음"}
      </strong>
      <span className="text-sidebar-muted mt-1 block text-[11px]">
        {profile.academyId
          ? "선생님 권한"
          : "관리자에게 학원 배정을 요청하세요"}
      </span>
    </div>
  );
}
