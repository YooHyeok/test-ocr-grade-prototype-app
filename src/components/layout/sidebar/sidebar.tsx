import { cn } from "@/lib/utils";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";
import SidebarFooter from "./sidebar-footer";
import SidebarHeader from "./sidebar-header";
import SidebarNav from "./sidebar-nav";

/**
 * 좌측 고정 사이드바. 모바일 폭에서는 숨기고 하단 내비게이션(MobileNav)으로 대체한다.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
  const compact = useSidebarCompact();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 flex flex-col pt-6 pb-4.5 whitespace-nowrap transition-[width] duration-200 max-sm:hidden",
        compact ? "w-[68px] px-[11px]" : "w-[238px] overflow-hidden px-[17px]",
      )}
    >
      <SidebarHeader />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
