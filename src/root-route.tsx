import { Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/layout/app-layout";
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
 * @returns {JSX.Element}
 */
export default function RootRoute() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* 선생님 모드 */}
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

        {/* 학생 모드 */}
        <Route path="/my-papers" element={<MyPapersPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
