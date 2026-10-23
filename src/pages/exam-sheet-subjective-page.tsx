import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SheetWorkspace from "@/components/exam-sheet/sheet-workspace";
import SheetList from "@/components/exam-sheet/sheet-list";
import PreviewCard from "@/components/exam-sheet/preview-card";
import SheetViewTabs, {
  type SheetView,
} from "@/components/exam-sheet/subjective/sheet-view-tabs";
import QuestionSummary from "@/components/exam-sheet/subjective/question-summary";
import SubjectivePaper from "@/components/exam-sheet/subjective/subjective-paper";
import AnswerOverview from "@/components/exam-sheet/subjective/answer-overview";
import { SUBJECTIVE_QUESTIONS, SUBJECTIVE_SHEETS } from "@/lib/mock-data";

/**
 * 시험지 관리 · 주관식 페이지.
 * @returns {JSX.Element}
 */
export default function ExamSheetSubjectivePage() {
  const [view, setView] = useState<SheetView>("editor");
  const [selectedId, setSelectedId] = useState(SUBJECTIVE_SHEETS[0].id);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sheet = useMemo(
    () => SUBJECTIVE_SHEETS.find((item) => item.id === selectedId)!,
    [selectedId],
  );
  const questions = useMemo(
    () => SUBJECTIVE_QUESTIONS[selectedId] ?? [],
    [selectedId],
  );

  const handleSelectSheet = useCallback((id: number) => {
    setSelectedId(id);
    setSelectedIndex(0);
  }, []);

  return (
    <>
      <SheetViewTabs value={view} onChange={setView} />
      <SheetWorkspace
        side={
          <>
            <SheetList
              title="등록된 시험지 양식"
              sheets={SUBJECTIVE_SHEETS}
              selectedId={selectedId}
              onSelect={handleSelectSheet}
              icon={FileText}
            />
            {view === "editor" && (
              <QuestionSummary
                index={selectedIndex}
                question={questions[selectedIndex]}
              />
            )}
          </>
        }
      >
        {view === "editor" ? (
          <PreviewCard
            title="시험지 양식 미리보기"
            description="편집하기를 누르면 이 화면에서 문항과 OCR 영역을 바로 수정할 수 있습니다."
            actions={
              <>
                <Button>편집하기</Button>
                <Button variant="secondary">인쇄</Button>
              </>
            }
          >
            <SubjectivePaper
              sheet={sheet}
              questions={questions}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
          </PreviewCard>
        ) : (
          <AnswerOverview questions={questions} />
        )}
      </SheetWorkspace>
    </>
  );
}
