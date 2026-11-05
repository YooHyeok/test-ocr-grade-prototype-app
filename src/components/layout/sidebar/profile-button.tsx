import { useCallback } from "react";
import { Ellipsis, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { useSession } from "@/store/session";

const ROLE_LABEL = { teacher: "선생님", student: "학생" } as const;

/**
 * 로그인 사용자 프로필 버튼. 누르면 계정 정보와 로그아웃 메뉴를 띄운다.
 * 아이콘 전용 사이드바에서는 아바타만 표시한다.
 * @returns {JSX.Element}
 */
export default function ProfileButton() {
  const compact = useSidebarCompact();
  const session = useSession();
  const profile = useCurrentProfile();
  const { mutate: signOut, isPending } = useSignOut({
    onError: (error) =>
      toast.error(getErrorMessage(error), { position: "top-center" }),
  });

  const handleSignOut = useCallback(() => signOut(), [signOut]);

  const name = profile?.name || session?.user.email || "사용자";
  const roleLabel = profile ? ROLE_LABEL[profile.role] : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="계정 메뉴"
          className={cn(
            "flex w-full items-center gap-2.5 px-0.5 py-1.5 text-left",
            compact && "justify-center",
          )}
        >
          <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-white/25 text-xs">
            {name[0]}
          </span>
          {!compact && (
            <>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm">{name}</strong>
                <small className="text-sidebar-muted mt-0.5 block text-[10px]">
                  {roleLabel}
                </small>
              </span>
              <Ellipsis className="size-4" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-56 p-2">
        <div className="border-b px-2 pt-1 pb-2.5">
          <strong className="block text-sm">{name}</strong>
          <small className="text-muted-foreground block truncate text-xs">
            {session?.user.email}
          </small>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isPending}
          className="hover:bg-muted mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm disabled:opacity-50"
        >
          <LogOut className="size-4" />
          로그아웃
        </button>
      </PopoverContent>
    </Popover>
  );
}
