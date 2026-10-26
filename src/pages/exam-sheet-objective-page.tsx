import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import SheetWorkspace from "@/components/exam-sheet/sheet-workspace";
import SheetList from "@/components/exam-sheet/sheet-list";
import PreviewCard from "@/components/exam-sheet/preview-card";
import ChoiceSummary from "@/components/exam-sheet/objective/choice-summary";
import ObjectivePaper from "@/components/exam-sheet/objective/objective-paper";
import { useSheetSelection } from "@/hooks/use-sheet-selection";
import { OBJECTIVE_QUESTIONS, OBJECTIVE_SHEETS } from "@/lib/mock-data";

/**
 * 시험지 관리 · 객관식 페이지.
 * @returns {JSX.Element}
 */
export default function ExamSheetObjectivePage() {
  const {
    sheet,
    questions,
    selectedId,
    selectedIndex,
    selectSheet,
    selectQuestion,
  } = useSheetSelection(OBJECTIVE_SHEETS, OBJECTIVE_QUESTIONS);

  return (
    <SheetWorkspace
      side={
        <>
          <SheetList
            title="등록된 객관식 시험지"
            sheets={OBJECTIVE_SHEETS}
            selectedId={selectedId}
            onSelect={selectSheet}
            icon={ListChecks}
          />
          <ChoiceSummary
            index={selectedIndex}
            question={questions[selectedIndex]}
          />
        </>
      }
    >
      <PreviewCard
        title="객관식 시험지 미리보기"
        description="문항을 선택하면 좌측에 보기·정답이 표시됩니다."
        actions={<Button variant="secondary">인쇄</Button>}
      >
        {sheet && (
          <ObjectivePaper
            sheet={sheet}
            questions={questions}
            selectedIndex={selectedIndex}
            onSelect={selectQuestion}
          />
        )}
      </PreviewCard>
    </SheetWorkspace>
  );
}
