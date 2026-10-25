import { memo } from "react";
import { FolderTree } from "lucide-react";
import type { CategoryGroup } from "@/type";

type Props = {
  group: CategoryGroup;
};

/**
 * 시험 카테고리 그룹 카드 하나 (학교급·과목과 포함 단원).
 * TODO: 카테고리 관리 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
function CategoryCard({ group }: Readonly<Props>) {
  return (
    <article className="surface p-4.5">
      <FolderTree className="text-primary mb-2 size-6" />
      <h3 className="mb-1 text-[15px] font-bold">{group.title}</h3>
      <p className="text-muted-foreground text-xs">{group.units}</p>
      <button type="button" className="text-primary mt-2.5 text-xs font-bold">
        카테고리 관리
      </button>
    </article>
  );
}

export default memo(CategoryCard);
