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
    <section className="mt-5.5 grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-sm:grid-cols-1">
      {QUICK_LINKS.map(({ to, icon: Icon, title, description }) => (
        <Link key={to} to={to} className="surface grid gap-1.5 p-4">
          <Icon className="text-primary size-5" />
          <strong>{title}</strong>
          <small className="text-muted-foreground">{description}</small>
        </Link>
      ))}
    </section>
  );
}
