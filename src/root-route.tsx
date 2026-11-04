import { Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/layout/app-layout";
import GuestOnlyLayout from "@/components/layout/guest-only-layout";
import MemberOnlyLayout from "@/components/layout/member-only-layout";
import RoleOnlyLayout from "@/components/layout/role-only-layout";
import SignInPage from "@/pages/sign-in-page";
import DashboardPage from "@/pages/dashboard-page";
import ExamSheetSubjectivePage from "@/pages/exam-sheet-subjective-page";
import ExamSheetObjectivePage from "@/pages/exam-sheet-objective-page";
import GradingPage from "@/pages/grading-page";
import StudentsPage from "@/pages/students-page";
import GroupsPage from "@/pages/groups-page";
import SettingsPage from "@/pages/settings-page";
import MyPapersPage from "@/pages/my-papers-page";
import UploadPage from "@/pages/upload-page";

/**
 * 라우트 정의. 메뉴 구성(제목/설명/아이콘)은 src/lib/menu.ts에서 관리한다.
 * - 비로그인: 로그인 화면만 접근
 * - 로그인: 모드(선생님/학생)별 화면만 접근, 다른 모드 주소는 자기 첫 화면으로 이동
 * @returns {JSX.Element}
 */
export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GuestOnlyLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
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
