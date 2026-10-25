import type { LucideIcon } from "lucide-react";
import type { ExamSheet } from "@/type";
import SheetListItem from "./sheet-list-item";

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
  icon,
}: Readonly<Props>) {
  return (
    <aside className="bg-card min-h-0 overflow-y-auto rounded-xl border">
      <div className="flex items-baseline justify-between gap-2 border-b p-3.5">
        <strong className="text-sm">{title}</strong>
        <small className="text-muted-foreground shrink-0 text-[11px]">
          총 {sheets.length}개
        </small>
      </div>
      {sheets.map((sheet) => (
        <SheetListItem
          key={sheet.id}
          sheet={sheet}
          selected={sheet.id === selectedId}
          onSelect={onSelect}
          icon={icon}
        />
      ))}
    </aside>
  );
}
