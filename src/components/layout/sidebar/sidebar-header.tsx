import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsSidebarCollapsed, useToggleSidebar } from "@/store/sidebar";
import { TABLET_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useSidebarCompact } from "@/hooks/use-sidebar-compact";

/**
 * 사이드바 상단. 서비스 로고와 접기/펼치기 버튼을 표시한다.
 * 태블릿 폭에서는 항상 아이콘 전용이므로 토글 버튼을 숨긴다.
 * @returns {JSX.Element}
 */
export default function SidebarHeader() {
  const compact = useSidebarCompact();
  const isTablet = useMediaQuery(TABLET_QUERY);
  const isCollapsed = useIsSidebarCollapsed();
  const toggle = useToggleSidebar();

  return (
    <div
      className={cn(
        "flex min-h-[45px] items-start justify-between gap-2",
        compact && "justify-center",
      )}
    >
      {!compact && (
        <div className="p-1">
          <strong className="block text-lg">케미체크</strong>
          <span className="text-sidebar-muted mt-0.5 block text-[10px]">
            화학 쪽지시험 채점 관리
          </span>
        </div>
      )}
      {!isTablet && (
        <button
          type="button"
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-expanded={!isCollapsed}
          onClick={toggle}
          className="-mt-1 -mr-1.5 grid size-8 shrink-0 place-items-center rounded-[7px] bg-white/8 hover:bg-white/15"
        >
          <Menu className="size-4" />
        </button>
      )}
    </div>
  );
}
