import { useCallback, useMemo, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

/**
 * 페이지 번호 버튼 목록.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
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

  return (
    <nav aria-label="페이지" className="mt-5 flex justify-center gap-1.5">
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
    </nav>
  );
}
