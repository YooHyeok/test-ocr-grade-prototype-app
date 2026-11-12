import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/layout/app-layout";
import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import MemberOnlyLayout from "@/components/layout/member-only-layout";
import RoleOnlyLayout from "@/components/layout/role-only-layout";
import GlobalLoader from "@/components/global-loader";

// 페이지는 처음 방문할 때 코드를 내려받는다. (첫 로딩 번들 크기 축소)
const SignInPage = lazy(() => import("@/pages/sign-in-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const ExamSheetSubjectivePage = lazy(
  () => import("@/pages/exam-sheet-subjective-page"),
);
const ExamSheetObjectivePage = lazy(
  () => import("@/pages/exam-sheet-objective-page"),
);
const GradingPage = lazy(() => import("@/pages/grading-page"));
const StudentsPage = lazy(() => import("@/pages/students-page"));
const GroupsPage = lazy(() => import("@/pages/groups-page"));
const SettingsPage = lazy(() => import("@/pages/settings-page"));
const MyPapersPage = lazy(() => import("@/pages/my-papers-page"));
const UploadPage = lazy(() => import("@/pages/upload-page"));

/**
 * 라우트 정의. 메뉴 구성(제목/설명/아이콘)은 src/lib/menu.ts에서 관리한다.
 * - 비로그인: 로그인 화면만 접근
 * - 로그인: 모드(선생님/학생)별 화면만 접근, 다른 모드 주소는 자기 첫 화면으로 이동
 * - 로그인 후 화면은 AppLayout 안에서 지연 로딩한다. (사이드바·헤더는 유지)
 * @returns {JSX.Element}
 */
export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GuestOnlyLayout />}>
        <Route
          path="/sign-in"
          element={
            <Suspense fallback={<GlobalLoader />}>
              <SignInPage />
            </Suspense>
          }
        />
      </Route>

      <Route element={<MemberOnlyLayout />}>
        <Route element={<AppLayout />}>
          <Route element={<RoleOnlyLayout mode="teacher" />}>
            <Route path="/" element={<DashboardPage />} />
            <Route
              path="/exam-sheets/subjective"
              element={<ExamSheetSubjectivePage />}
            />
            <Route
              path="/exam-sheets/objective"
              element={<ExamSheetObjectivePage />}
            />
            <Route path="/grading" element={<GradingPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<RoleOnlyLayout mode="student" />}>
            <Route path="/my-papers" element={<MyPapersPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
