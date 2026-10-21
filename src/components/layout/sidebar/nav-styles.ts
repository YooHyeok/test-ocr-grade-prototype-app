import { cva } from "class-variance-authority";

/** 아이콘 전용 사이드바에서 hover/focus 시 오른쪽에 뜨는 툴팁 (data-tooltip 속성 사용) */
export const tooltipClass =
  "after:pointer-events-none after:absolute after:top-1/2 after:left-[calc(100%+10px)] after:z-50 after:w-max after:-translate-x-[3px] after:-translate-y-1/2 after:rounded-md after:bg-sidebar-tooltip after:px-2.5 after:py-1.5 after:text-[11px] after:font-bold after:text-sidebar-accent-foreground after:opacity-0 after:shadow-md after:transition after:content-[attr(data-tooltip)] hover:after:translate-x-0 hover:after:opacity-100 focus-visible:after:translate-x-0 focus-visible:after:opacity-100";

/** 사이드바 메뉴 한 줄(링크/아코디언 버튼) 스타일 */
export const navItemVariants = cva(
  "relative flex w-full items-center gap-3 rounded-[9px] text-left text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  {
    variants: {
      active: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
      },
      compact: {
        true: ["min-h-11 justify-center gap-0 p-0", tooltipClass],
        false: "px-3.5 py-2.5",
      },
      child: {
        true: "px-3 py-2 text-[13px]",
      },
    },
  },
);
