import type { CategoryGroup } from "@/type";
import CategoryCard from "./category-card";

type Props = {
  groups: CategoryGroup[];
};

/**
 * 시험 카테고리 그룹 카드 목록 (학교급·과목별 단원 묶음).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function CategoryBoard({ groups }: Readonly<Props>) {
  return (
    <div className="mt-5.5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
      {groups.map((group) => (
        <CategoryCard key={group.title} group={group} />
      ))}
    </div>
  );
}
