import {
  ClipboardCheck,
  FileStack,
  FileText,
  FolderTree,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Mode } from "@/type";

/** 단일 메뉴 항목 */
export type MenuItem = {
  to: string;
  label: string;
  icon?: LucideIcon;
  /** 헤더 제목 옆에 표시되는 화면 설명 */
  subtitle?: string;
  /** 모바일 하단 내비게이션에서 강조(원형 버튼)로 표시할지 여부 */
  primary?: boolean;
};

/** 하위 메뉴를 가진 아코디언 그룹 */
export type MenuGroup = {
  label: string;
  icon: LucideIcon;
  children: MenuItem[];
};

/** 사이드바 최상위 메뉴. 모드별로 노출 여부가 갈린다. */
export type MenuEntry = (MenuItem | MenuGroup) & { mode: Mode };

/** 모드 전환 시 이동할 첫 화면 */
export const HOME_BY_MODE: Record<Mode, string> = {
  teacher: "/",
  student: "/my-papers",
};

export const MENU: MenuEntry[] = [
  { mode: "teacher", to: "/", label: "대시보드", icon: LayoutDashboard },
  {
    mode: "teacher",
    label: "시험지 관리",
    icon: FileText,
    children: [
      {
        to: "/exam-sheets/subjective",
        label: "주관식",
        subtitle:
          "주관식(단답형) 양식을 만들고, 문항별 OCR 인식 영역과 기준 답안을 설정합니다.",
      },
      {
        to: "/exam-sheets/objective",
        label: "객관식",
        subtitle: "객관식 양식을 만들고, 문항별 보기와 정답을 설정합니다.",
      },
    ],
  },
  {
    mode: "teacher",
    to: "/grading",
    label: "채점 관리",
    icon: ClipboardCheck,
    subtitle:
      "학원, 클래스, 카테고리, 학생별로 시험지 원본과 결과를 관리합니다.",
  },
  {
    mode: "teacher",
    to: "/students",
    label: "학생 관리",
    icon: Users,
    subtitle: "학원과 클래스별 학생 계정, 최근 성적, 업로드 현황을 관리합니다.",
  },
  {
    mode: "teacher",
    to: "/groups",
    label: "그룹 관리",
    icon: FolderTree,
    subtitle: "학교급, 과목, 단원을 기준으로 시험지를 체계적으로 분류합니다.",
  },
  {
    mode: "teacher",
    to: "/settings",
    label: "설정",
    icon: Settings,
    subtitle: "학원 정보와 채점 정책을 관리합니다.",
  },
  {
    mode: "student",
    to: "/my-papers",
    label: "내 시험지",
    icon: FileStack,
    subtitle:
      "올린 시험지를 확인하고, 준비가 끝났을 때 직접 채점을 시작하세요.",
  },
  {
    mode: "student",
    to: "/upload",
    label: "시험지 첨부",
    icon: Plus,
    subtitle:
      "시험지 사진과 카테고리를 저장합니다. 채점은 저장 후 별도로 시작합니다.",
    primary: true,
  },
];

/**
 * 메뉴 항목이 아코디언 그룹인지 판별한다.
 * @param {MenuItem | MenuGroup} entry - 메뉴 항목
 * @returns {boolean} 그룹이면 true
 */
export function isMenuGroup(entry: MenuItem | MenuGroup): entry is MenuGroup {
  return "children" in entry;
}

/**
 * 경로에 해당하는 메뉴 항목을 찾는다. 그룹 하위 항목까지 탐색한다.
 * 그룹 하위 항목은 헤더에 "그룹명 · 항목명" 형태로 표시되도록 label을 합쳐 반환한다.
 * @param {string} pathname - 현재 경로
 * @returns {MenuItem | undefined} 일치하는 메뉴 항목
 */
export function findMenuItem(pathname: string): MenuItem | undefined {
  for (const entry of MENU) {
    if (!isMenuGroup(entry)) {
      if (entry.to === pathname) return entry;
      continue;
    }
    const child = entry.children.find((item) => item.to === pathname);
    if (child) return { ...child, label: `${entry.label} · ${child.label}` };
  }
  return undefined;
}
