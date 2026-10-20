import { Navigate, Route, Routes } from "react-router";
import GlobalLayout from "@/components/layout/global-layout";
import DashboardPage from "@/pages/dashboard-page";
import GradingPage from "@/pages/grading-page";
import ExamSheetSubjectivePage from "@/pages/exam-sheet-subjective-page";
import ExamSheetObjectivePage from "@/pages/exam-sheet-objective-page";
import UploadPage from "@/pages/upload-page";

/**
 * 라우트 정의. 화면 구성은 docs/PRODUCT_PLAN.md §3, §9를 따른다.
 * @returns {JSX.Element}
 */
export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/grading" element={<GradingPage />} />
        <Route
          path="/exam-sheets/subjective"
          element={<ExamSheetSubjectivePage />}
        />
        <Route
          path="/exam-sheets/objective"
          element={<ExamSheetObjectivePage />}
        />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
