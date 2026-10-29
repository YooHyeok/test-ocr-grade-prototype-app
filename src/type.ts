/** 화면 모드. 선생님(관리자) 모드와 학생 모드로 메뉴와 화면이 나뉜다. */
export type Mode = "teacher" | "student";

/** TanStack Query mutation 훅에 넘기는 공통 콜백 */
export type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

/** 채점 상태 */
export type GradingStatus = "채점 완료" | "검토 필요";

/** 채점 관리 기록 */
export type GradingRecord = {
  date: string;
  student: string;
  grade: string;
  academy: string;
  className: string;
  category: string;
  paper: string;
  score: number;
  status: GradingStatus;
};

/** 학생 목록 카드 */
export type Student = {
  name: string;
  className: string;
  needsReview: boolean;
};

/** 시험지 양식 (주관식/객관식 공통) */
export type ExamSheet = {
  id: number;
  name: string;
  category: string;
  subject: string;
  count: number;
};

/** OCR 인식 영역 좌표 (시험지 원본 이미지 기준) */
export type Region = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** 주관식 문항 */
export type SubjectiveQuestion = {
  id: number;
  question: string;
  answer: string;
  aliases: string;
  region: Region;
};

/** 객관식 문항 */
export type ObjectiveQuestion = {
  id: number;
  question: string;
  choices: string[];
  /** 정답 보기 index (0부터) */
  answer: number;
};

/** 학생이 올린 시험지 상태 */
export type PaperStatus = "업로드 완료" | "채점 완료";

/** 학생 시험지 이력 */
export type MyPaper = {
  id: number;
  title: string;
  category: string;
  uploaded: string;
  /** YYYY-MM-DD */
  date: string;
  status: PaperStatus;
  score?: number;
};

/** 시험 카테고리 그룹 */
export type CategoryGroup = {
  title: string;
  units: string;
};

/** 클래스별 담당 선생님 */
export type TeacherAssignment = {
  category: string;
  className: string;
  teacher: string;
  role: "주 담당" | "보조";
};
