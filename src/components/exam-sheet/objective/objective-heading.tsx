import type { ExamSheet } from "@/type";

type Props = {
  sheet: ExamSheet;
};

/**
 * 객관식 시험지 머리글 (시험지명, 카테고리·과목, 이름 칸).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ObjectiveHeading({ sheet }: Readonly<Props>) {
  return (
    <div className="mb-4.5 flex items-end justify-between gap-3.5 border-b-2 border-[#625d54] pb-3.5">
      <div>
        <strong className="text-foreground block text-[17px]">
          {sheet.name}
        </strong>
        <span className="text-xs text-[#8a857c]">
          {sheet.category} · {sheet.subject}
        </span>
      </div>
      <span className="text-xs text-[#8a857c]">이름 ____________</span>
    </div>
  );
}
