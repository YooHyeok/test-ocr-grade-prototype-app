import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "대시보드" },
  { to: "/grading", label: "채점 관리" },
  { to: "/exam-sheets/subjective", label: "시험지 관리 · 주관식" },
  { to: "/exam-sheets/objective", label: "시험지 관리 · 객관식" },
  { to: "/upload", label: "시험지 업로드" },
];

/**
 * 공통 레이아웃. 헤더 내비게이션과 기획 프로토타입 링크를 제공한다.
 * @returns {JSX.Element}
 */
export default function GlobalLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="m-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
          <span className="font-bold">케미체크</span>
          <nav className="flex flex-1 gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground font-semibold",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <a
            href="/prototype/index.html"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground text-sm underline"
          >
            기획 프로토타입
          </a>
        </div>
      </header>
      <main className="m-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
