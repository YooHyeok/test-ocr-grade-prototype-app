import { useMemo } from "react";
import { useLocation } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findMenuItem } from "@/lib/menu";

/**
 * 상단 헤더. 현재 화면의 제목/설명과 화면별 액션 버튼을 표시한다.
 * @returns {JSX.Element}
 */
export default function Header() {
  const { pathname } = useLocation();
  const menuItem = useMemo(() => findMenuItem(pathname), [pathname]);

  return (
    <header className="bg-card sticky top-0 z-30 flex items-center justify-between border-b px-7 py-2.5 max-md:px-5 max-sm:flex-col max-sm:items-start max-sm:gap-4 max-sm:px-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="text-xl font-bold tracking-tight max-sm:text-[22px]">
          {menuItem?.label ?? "케미체크"}
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
    </header>
  );
}
