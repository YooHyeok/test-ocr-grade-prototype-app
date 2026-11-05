import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import AcademyCard from "./academy-card";
import ProfileButton from "./profile-button";

/**
 * 사이드바 하단. 소속 학원과 로그인 사용자 프로필(로그아웃 메뉴)을 표시한다.
 * @returns {JSX.Element}
 */
export default function SidebarFooter() {
  const compact = useSidebarCompact();

  return (
    <div className="mt-auto">
      {!compact && <AcademyCard />}
      <ProfileButton />
    </div>
  );
}
