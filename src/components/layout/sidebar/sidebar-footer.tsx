import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import AcademyCard from "./academy-card";
import ModeSwitch from "./mode-switch";
import ModeToggle from "./mode-toggle";
import ProfileButton from "./profile-button";

/**
 * 사이드바 하단. 학원 정보, 프로필, 모드 전환을 표시한다.
 * @returns {JSX.Element}
 */
export default function SidebarFooter() {
  const compact = useSidebarCompact();

  return (
    <div className="mt-auto">
      {!compact && <AcademyCard />}
      <ProfileButton />
      {compact ? <ModeToggle /> : <ModeSwitch />}
    </div>
  );
}
