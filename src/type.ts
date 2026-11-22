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

/** 가입 유형 */
export type SignupType = "student" | "teacher";

/** 가입 신청. 본인인증을 마치고 학원(선생님)의 승인을 기다린다. */
export type SignupRequest = {
  id: number;
  type: SignupType;
  name: string;
  /** 학생만 (선생님은 빈 문자열) */
  grade: string;
  academy: string;
  email: string;
  /** 본인인증한 휴대폰 번호 (010-0000-0000) */
  phone: string;
  /** 신청 시각 "YYYY-MM-DD HH:MM" */
  requestedAt: string;
};

/** 알림 받는 방법 */
export type NotifyMethod = "email" | "push" | "sms" | "kakao";

/** 문자·카카오톡 받을 번호 */
export type NotifyPhone = {
  /** true면 본인인증한 번호로 받는다. */
  useVerified: boolean;
  /** 다른 번호로 받을 때 입력한 번호 */
  phone: string;
};

/** 학생의 알림 받는 방법 설정 (여러 개 선택) */
export type NotifyPrefs = {
  methods: NotifyMethod[];
  /** 알림 받을 이메일 */
  email: string;
  /** 이 기기에서 브라우저 알림을 허용했는지 */
  pushAllowed: boolean;
  sms: NotifyPhone;
  kakao: NotifyPhone;
};
