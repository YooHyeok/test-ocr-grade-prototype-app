import { Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import Sidebar from "./sidebar/sidebar";
import Header from "./header";
import Footer from "./footer";
import MobileNav from "./mobile-nav";

/**
 * 앱 공통 레이아웃.
 * - 데스크톱: 사이드바(펼침/접힘) + 헤더 + 본문
 * - 태블릿(820px 미만): 아이콘 전용 사이드바
 * - 모바일(600px 미만): 사이드바 숨김 + 하단 내비게이션
 * @returns {JSX.Element}
 */
export default function AppLayout() {
  const compact = useSidebarCompact();

  return (
    <>
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200 max-sm:ml-0 max-sm:pb-[70px]",
          compact ? "ml-[68px]" : "ml-[238px]",
        )}
      >
        <Header />
        <div className="flex flex-1 flex-col px-7 pt-3.5 pb-5.5 max-md:px-5 max-sm:px-4">
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <MobileNav />
    </>
  );
}
