import { useCallback, useMemo } from "react";
import { useLocation } from "react-router";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { findMenuItem } from "@/lib/menu";
import { getErrorMessage } from "@/lib/error";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";

/**
 * 상단 헤더. 현재 화면의 제목/설명과 화면별 액션 버튼을 표시한다.
 * 모바일은 사이드바(계정 메뉴)가 없으므로 오른쪽 위에 로그아웃을 항상 보여준다.
 * @returns {JSX.Element}
 */
export default function Header() {
  const { pathname } = useLocation();
  const mode = useCurrentMode();
  const menuItem = useMemo(
    () => findMenuItem(pathname, mode),
    [pathname, mode],
  );
  const { mutate: signOut, isPending } = useSignOut({
    onError: (error) =>
      toast.error(getErrorMessage(error), { position: "top-center" }),
  });
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <header className="bg-card sticky top-0 z-30 flex items-center justify-between border-b px-7 py-2.5 max-md:px-5 max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:px-4">
      <div className="flex flex-wrap items-baseline gap-3 max-sm:pr-28">
        <h1 className="text-xl font-bold tracking-tight max-sm:text-[22px]">
          {menuItem?.label ?? "쪽지시험"}
        </h1>
        {menuItem?.subtitle && (
          <p className="text-muted-foreground text-xs font-medium">
            {menuItem.subtitle}
          </p>
        )}
      </div>
      {pathname === "/exam-sheets/subjective" && (
        <Button className="max-sm:hidden">
          <Plus />새 시험지 양식
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={isPending}
        className="absolute top-2.5 right-4 text-[#c0392b] sm:hidden"
      >
        <LogOut />
        로그아웃
      </Button>
    </header>
  );
}
