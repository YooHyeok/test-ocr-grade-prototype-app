import { memo, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamSheet } from "@/type";

type Props = {
  sheet: ExamSheet;
  selected: boolean;
  onSelect: (id: number) => void;
  icon: LucideIcon;
};

/**
 * 시험지 양식 목록의 항목 하나.
 * @param {Props} props
 * @returns {JSX.Element}
 */
function SheetListItem({
  sheet,
  selected,
  onSelect,
  icon: Icon,
}: Readonly<Props>) {
  const handleClick = useCallback(
    () => onSelect(sheet.id),
    [onSelect, sheet.id],
  );

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={handleClick}
      className={cn(
        "hover:text-primary flex w-full items-center gap-2.5 border-b border-[#eef0ee] p-3 text-left text-[#56635e] hover:bg-[#f1f8f4]",
        selected && "text-primary bg-[#f1f8f4]",
      )}
    >
      <Icon className="text-primary size-5 shrink-0" />
      <span className="grid gap-1">
        <strong className="text-[13px]">{sheet.name}</strong>
        <small className="text-[10px] text-[#929d99]">
          {sheet.category} · {sheet.count}문항
        </small>
      </span>
    </button>
  );
}

export default memo(SheetListItem);
