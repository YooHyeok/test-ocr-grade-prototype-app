import { useCallback, useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import SheetWorkspace from "@/components/exam-sheet/sheet-workspace";
import SheetList from "@/components/exam-sheet/sheet-list";
import PreviewCard from "@/components/exam-sheet/preview-card";
import ChoiceSummary from "@/components/exam-sheet/objective/choice-summary";
import ObjectivePaper from "@/components/exam-sheet/objective/objective-paper";
import { OBJECTIVE_QUESTIONS, OBJECTIVE_SHEETS } from "@/lib/mock-data";

/**
 * 시험지 관리 · 객관식 페이지.
 * @returns {JSX.Element}
 */
export default function ExamSheetObjectivePage() {
  const [selectedId, setSelectedId] = useState(OBJECTIVE_SHEETS[0].id);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sheet = useMemo(
    () => OBJECTIVE_SHEETS.find((item) => item.id === selectedId)!,
    [selectedId],
  );
  const questions = useMemo(
    () => OBJECTIVE_QUESTIONS[selectedId] ?? [],
    [selectedId],
  );

  const handleSelectSheet = useCallback((id: number) => {
    setSelectedId(id);
    setSelectedIndex(0);
  }, []);

  return (
    <SheetWorkspace
      side={
        <>
          <SheetList
            title="등록된 객관식 시험지"
            sheets={OBJECTIVE_SHEETS}
            selectedId={selectedId}
            onSelect={handleSelectSheet}
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
        <ObjectivePaper
          sheet={sheet}
          questions={questions}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </PreviewCard>
    </SheetWorkspace>
  );
}
