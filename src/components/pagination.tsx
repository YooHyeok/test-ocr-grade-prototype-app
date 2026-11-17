import { useCallback, useMemo, type MouseEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 처음·이전·다음·마지막 화살표 표시 */
  withArrows?: boolean;
};

const ARROW_CLASS =
  "grid size-8 place-items-center rounded-[7px] text-[#9aa5a0] hover:text-foreground disabled:opacity-40 disabled:hover:text-[#9aa5a0]";

/**
 * 페이지 번호 버튼 목록.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
  withArrows = false,
}: Readonly<Props>) {
  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onChange(Number(event.currentTarget.value)),
    [onChange],
  );

  const arrow = (target: number, label: string, Icon: typeof ChevronLeft) => (
    <button
      type="button"
      value={target}
      aria-label={label}
      onClick={handleClick}
      disabled={target === page || target < 1 || target > totalPages}
      className={ARROW_CLASS}
    >
      <Icon className="size-4" />
    </button>
  );

  return (
    <nav aria-label="페이지" className="mt-5 flex justify-center gap-1.5">
      {withArrows && arrow(1, "처음 페이지", ChevronsLeft)}
      {withArrows && arrow(page - 1, "이전 페이지", ChevronLeft)}
      {pages.map((number) => (
        <button
          key={number}
          type="button"
          value={number}
          aria-current={number === page ? "page" : undefined}
          onClick={handleClick}
          className={cn(
            "bg-card size-8 rounded-[7px] border text-xs font-bold text-[#76827d]",
            number === page &&
              "border-primary bg-primary text-primary-foreground",
          )}
        >
          {number}
        </button>
      ))}
      {withArrows && arrow(page + 1, "다음 페이지", ChevronRight)}
      {withArrows && arrow(totalPages, "마지막 페이지", ChevronsRight)}
    </nav>
  );
}
