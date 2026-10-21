import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/type";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";

/** TODO: 세션 연동 전까지 기획 프로토타입의 예시 프로필을 사용한다. */
const PROFILE_BY_MODE: Record<Mode, { name: string; role: string }> = {
  teacher: { name: "전선생", role: "academy admin" },
  student: { name: "유재혁", role: "student account" },
};

/**
 * 로그인 사용자 프로필 버튼. 아이콘 전용 모드에서는 아바타만 표시한다.
 * @returns {JSX.Element}
 */
export default function ProfileButton() {
  const compact = useSidebarCompact();
  const mode = useCurrentMode();
  const profile = PROFILE_BY_MODE[mode];

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2.5 px-0.5 py-1.5 text-left",
        compact && "justify-center",
      )}
    >
      <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-white/25 text-xs">
        {profile.name[0]}
      </span>
      {!compact && (
        <>
          <span className="flex-1">
            <strong className="block text-sm">{profile.name}</strong>
            <small className="text-sidebar-muted mt-0.5 block text-[10px]">
              {profile.role}
            </small>
          </span>
          <Ellipsis className="size-4" />
        </>
      )}
    </button>
  );
}
