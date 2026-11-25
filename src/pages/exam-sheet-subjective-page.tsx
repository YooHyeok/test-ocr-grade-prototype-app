import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SegmentedTabs, { type TabOption } from "@/components/segmented-tabs";
import SheetWorkspace from "@/components/exam-sheet/sheet-workspace";
import SheetList from "@/components/exam-sheet/sheet-list";
import PreviewCard from "@/components/exam-sheet/preview-card";
import QuestionSummary from "@/components/exam-sheet/subjective/question-summary";
import SubjectivePaper from "@/components/exam-sheet/subjective/subjective-paper";
import AnswerOverview from "@/components/exam-sheet/subjective/answer-overview";
import { useSheetSelection } from "@/hooks/use-sheet-selection";
import { SUBJECTIVE_QUESTIONS, SUBJECTIVE_SHEETS } from "@/lib/mock-data";

type SheetView = "editor" | "answers";

const VIEW_TABS: TabOption<SheetView>[] = [
  { value: "editor", label: "양식 편집" },
  { value: "answers", label: "답안만 보기" },
];

/**
 * 시험지 관리 · 주관식 페이지.
 * @returns {JSX.Element}
 */
export default function ExamSheetSubjectivePage() {
  const [view, setView] = useState<SheetView>("editor");
  const {
    sheet,
    questions,
    selectedId,
    selectedIndex,
    selectSheet,
    selectQuestion,
  } = useSheetSelection(SUBJECTIVE_SHEETS, SUBJECTIVE_QUESTIONS);

  return (
    <>
      {/* 새 양식 버튼은 헤더가 아니라 보기 탭 줄 오른쪽 (눈에 잘 띄도록) */}
      <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <SegmentedTabs
          options={VIEW_TABS}
          value={view}
          onChange={setView}
          ariaLabel="시험지 관리 보기"
        />
        <Button className="max-sm:hidden">
          <Plus />새 주관식 양식
        </Button>
      </div>
      <SheetWorkspace
        side={
          <>
            <SheetList
              title="등록된 주관식 시험지"
              sheets={SUBJECTIVE_SHEETS}
              selectedId={selectedId}
              onSelect={selectSheet}
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
            title="주관식 시험지 미리보기"
            description="편집하기를 누르면 이 화면에서 문항과 OCR 영역을 바로 수정할 수 있습니다."
            actions={
              <>
                <Button>편집하기</Button>
                <Button variant="secondary">인쇄</Button>
              </>
            }
          >
            {sheet && (
              <SubjectivePaper
                sheet={sheet}
                questions={questions}
                selectedIndex={selectedIndex}
                onSelect={selectQuestion}
              />
            )}
          </PreviewCard>
        ) : (
          <AnswerOverview questions={questions} />
        )}
      </SheetWorkspace>
    </>
  );
}
