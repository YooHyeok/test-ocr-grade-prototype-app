import { FolderTree } from "lucide-react";
import type { CategoryGroup } from "@/type";

type Props = {
  groups: CategoryGroup[];
};

/**
 * 시험 카테고리 그룹 카드 목록 (학교급·과목별 단원 묶음).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function CategoryBoard({ groups }: Props) {
  return (
    <div className="mt-5.5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
      {groups.map((group) => (
        <article key={group.title} className="surface p-4.5">
          <FolderTree className="text-primary mb-2 size-6" />
          <h3 className="mb-1 text-[15px] font-bold">{group.title}</h3>
          <p className="text-muted-foreground text-xs">{group.units}</p>
          <button
            type="button"
            className="text-primary mt-2.5 text-xs font-bold"
          >
            카테고리 관리
          </button>
        </article>
      ))}
    </div>
  );
}
