import { useCallback, type MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExamSheet } from "@/type";

type Props = {
  title: string;
  sheets: ExamSheet[];
  selectedId: number;
  onSelect: (id: number) => void;
  icon: LucideIcon;
};

/**
 * 등록된 시험지 양식 목록. (주관식/객관식 공통)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SheetList({
  title,
  sheets,
  selectedId,
  onSelect,
  icon: Icon,
}: Props) {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onSelect(Number(event.currentTarget.value)),
    [onSelect],
  );

  return (
    <aside className="bg-card min-h-0 overflow-y-auto rounded-xl border">
      <div className="flex items-baseline justify-between gap-2 border-b p-3.5">
        <strong className="text-sm">{title}</strong>
        <small className="text-muted-foreground shrink-0 text-[11px]">
          총 {sheets.length}개
        </small>
      </div>
      {sheets.map((sheet) => (
        <button
          key={sheet.id}
          type="button"
          value={sheet.id}
          aria-pressed={sheet.id === selectedId}
          onClick={handleClick}
          className={cn(
            "hover:text-primary flex w-full items-center gap-2.5 border-b border-[#eef0ee] p-3 text-left text-[#56635e] hover:bg-[#f1f8f4]",
            sheet.id === selectedId && "text-primary bg-[#f1f8f4]",
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
      ))}
    </aside>
  );
}
