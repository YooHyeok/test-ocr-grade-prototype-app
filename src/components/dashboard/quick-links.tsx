import { Link } from "react-router";
import {
  ClipboardCheck,
  FileText,
  FolderTree,
  Users,
  type LucideIcon,
} from "lucide-react";

const QUICK_LINKS: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    to: "/exam-sheets/subjective",
    icon: FileText,
    title: "시험지 관리",
    description: "양식 이미지와 OCR 영역 설정",
  },
  {
    to: "/grading",
    icon: ClipboardCheck,
    title: "채점 관리",
    description: "전체 시험지 이력 확인",
  },
  {
    to: "/students",
    icon: Users,
    title: "학생 관리",
    description: "클래스별 학생 관리",
  },
  {
    to: "/groups",
    icon: FolderTree,
    title: "그룹 관리",
    description: "학교급 · 과목 · 단원 분류",
  },
];

/**
 * 대시보드 하단 바로가기 카드 목록.
 * @returns {JSX.Element}
 */
export default function QuickLinks() {
  return (
    <section className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2 max-sm:grid-cols-1">
      {QUICK_LINKS.map(({ to, icon: Icon, title, description }) => (
        <Link
          key={to}
          to={to}
          className="surface hover:border-primary/40 flex items-center gap-3 p-4 transition-colors"
        >
          <span className="bg-mint-soft text-primary grid size-10 shrink-0 place-items-center rounded-xl">
            <Icon className="size-5" />
          </span>
          <span className="grid gap-0.5">
            <strong className="text-sm">{title}</strong>
            <small className="text-muted-foreground text-xs">
              {description}
            </small>
          </span>
        </Link>
      ))}
    </section>
  );
}
