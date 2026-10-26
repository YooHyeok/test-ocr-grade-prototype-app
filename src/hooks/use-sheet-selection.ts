import { useCallback, useMemo, useState } from "react";
import type { ExamSheet } from "@/type";

/**
 * 시험지 관리 화면의 시험지·문항 선택 상태. (주관식/객관식 공통)
 * 다른 시험지를 고르면 문항 선택은 첫 문항으로 돌아간다.
 * @template Q 문항 타입
 * @param {ExamSheet[]} sheets - 시험지 목록
 * @param {Record<number, Q[]>} questionsBySheet - 시험지 id별 문항 목록
 * @returns {{ sheet: ExamSheet | undefined, questions: Q[], selectedId: number, selectedIndex: number, selectSheet: (id: number) => void, selectQuestion: (index: number) => void }}
 */
export function useSheetSelection<Q>(
  sheets: ExamSheet[],
  questionsBySheet: Record<number, Q[]>,
) {
  const [selectedId, setSelectedId] = useState(sheets[0]?.id ?? 0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sheet = useMemo(
    () => sheets.find((item) => item.id === selectedId),
    [sheets, selectedId],
  );
  const questions = useMemo(
    () => questionsBySheet[selectedId] ?? [],
    [questionsBySheet, selectedId],
  );

  const selectSheet = useCallback((id: number) => {
    setSelectedId(id);
    setSelectedIndex(0);
  }, []);

  return {
    sheet,
    questions,
    selectedId,
    selectedIndex,
    selectSheet,
    selectQuestion: setSelectedIndex,
  };
}
