/**
 * 백엔드 계약(인터페이스)과 도메인 타입.
 *
 * 계층 구조:
 *   화면 → TanStack Query 훅(hooks/queries, hooks/mutations: 캐싱·상태 관리)
 *        → api/*(백엔드 호출 진입점) → backend(이 계약의 구현체: supabase / spring / mock)
 *
 * 화면·훅·스토어는 이 파일의 타입만 사용하고, 특정 백엔드(Supabase 등)의 타입을 직접 쓰지 않는다.
 * 새 백엔드는 Backend 인터페이스를 구현해 lib/backend/index.ts에 등록한다.
 */
import type { BackendName } from "@/lib/app-config";

/** 계정 권한 */
export type AppRole = "teacher" | "student";

/** 로그인 사용자 */
export type AuthUser = {
  id: string;
  email: string | null;
};

/** 로그인 세션 */
export type AuthSession = {
  user: AuthUser;
};

/** 사용자 프로필 (권한, 이름, 소속 학원) */
export type Profile = {
  id: string;
  role: AppRole;
  name: string;
  academyId: string | null;
  academyName: string | null;
  /** 시스템 관리자 여부 (시스템 설정 화면 접근). 학원 권한(role)과 별개다. */
  isAdmin: boolean;
};

/**
 * 시스템 설정 값 유형. 유형이 입력 모양을 정한다.
 * STR 텍스트 / NUM 숫자 / BOOL 토글(true·false) / RADIO·SEL 선택지 중 하나 / CHECK 선택지 중 여러 개(쉼표로 이음)
 */
export type SystemSettingType =
  "STR" | "NUM" | "BOOL" | "RADIO" | "SEL" | "CHECK";

/** 열람 권한 (R: 열람만 가능, W: 수정 가능, H: 항목 숨김) */
export type SystemSettingAccess = "R" | "W" | "H";

/**
 * 시스템 설정 그룹. 코드는 영문 대문자 점 표기 계층이다. (WM → WM.MAIL_BATCH)
 * 최상위 그룹은 화면 탭, 하위 그룹은 탭 안의 구역이 된다.
 */
export type SystemSettingGroup = {
  id: string;
  name: string;
  description: string | null;
};

/** 시스템 설정 항목 (모든 학원에 공통 적용, 관리자 화면 "시스템 설정") */
export type SystemSetting = {
  id: string;
  /** 설정 키 = 소속 그룹 코드 + "." + 이름 (예: WM.MAIL_BATCH.ENABLED). 만든 뒤 바꿀 수 없다. */
  key: string;
  /** 최상위 그룹 코드 (예: WM) */
  groupId: string;
  /** 소속 하위 그룹 코드 (예: WM.MAIL_BATCH). 최상위 바로 아래면 null */
  subGroupId: string | null;
  name: string;
  description: string | null;
  type: SystemSettingType;
  value: string | null;
  /** 선택지 (RADIO·SEL·CHECK만 있고, 그 외 유형은 null) */
  options: string[] | null;
  access: SystemSettingAccess;
};

/** 시스템 설정 추가·수정 입력 */
export type SystemSettingInput = Omit<SystemSetting, "id">;

/** 시스템 설정 값 변경 */
export type SystemSettingChange = {
  key: string;
  value: string;
};

/** 시스템 설정 변경 유형 (I: 추가, U: 값 수정, D: 삭제) */
export type SystemSettingAction = "I" | "U" | "D";

/** 시스템 설정 변경 이력 */
export type SystemSettingHistory = {
  id: string;
  key: string | null;
  name: string | null;
  /** 최상위 그룹 코드 */
  groupId: string;
  groupName: string | null;
  action: SystemSettingAction;
  prevValue: string | null;
  nowValue: string | null;
  /** 변경 시각 (ISO) */
  changedAt: string | null;
  /** 변경자 이름 (시스템 변경은 "system") */
  changedBy: string | null;
};

/** 변경 이력 검색 조건 */
export type SystemSettingHistoryQuery = {
  /** 조회 일자 (한국 시간 YYYY-MM-DD). 없으면 전체 기간 */
  date: string | null;
  /** 최상위 그룹 코드. 없으면 전체 */
  groupId: string | null;
  /** 속성키 일부 (대소문자 무시) */
  key: string;
  /** 1부터 */
  page: number;
  pageSize: number;
};

/** 변경 이력 검색 결과 (최신순 한 페이지) */
export type SystemSettingHistoryPage = {
  items: SystemSettingHistory[];
  total: number;
};

/** 백엔드 공통 오류 코드. 각 구현체는 자기 오류를 이 코드로 바꿔서 던진다. */
export type BackendErrorCode =
  | "invalid_credentials"
  | "user_not_found"
  | "user_banned"
  | "session_expired"
  | "email_not_confirmed"
  | "invalid_email"
  | "rate_limited"
  | "not_found"
  | "forbidden"
  | "invalid_value"
  | "conflict"
  | "in_use"
  | "not_implemented"
  | "unknown";

/** 백엔드 공통 오류 */
export class BackendError extends Error {
  readonly code: BackendErrorCode;
  /** 원래 오류 (구현체의 오류 객체, 디버깅용) */
  readonly cause: unknown;

  /**
   * @param {BackendErrorCode} code - 공통 오류 코드
   * @param {string} message - 개발자용 메시지
   * @param {unknown} [cause] - 원래 오류 (구현체의 오류 객체)
   */
  constructor(code: BackendErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "BackendError";
    this.code = code;
    this.cause = cause;
  }
}

/** 인증 기능 */
export interface AuthApi {
  /** 이메일·비밀번호로 로그인하고 세션을 반환한다. */
  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<AuthSession>;
  /** 로그아웃한다. */
  signOut(): Promise<void>;
  /**
   * 세션 변화를 구독한다. 구독 직후 현재 세션(없으면 null)으로 한 번 호출된다.
   * @returns 구독 해제 함수
   */
  onSessionChange(listener: (session: AuthSession | null) => void): () => void;
}

/** 프로필 기능 */
export interface ProfileApi {
  /** 사용자 id로 프로필을 조회한다. */
  fetchById(userId: string): Promise<Profile>;
}

/**
 * 시스템 설정 기능 (시스템 관리자 전용).
 * 관리자가 아니면 조회는 빈 목록, 변경은 forbidden(또는 not_found) 오류.
 * 허용되지 않는 값은 invalid_value, 중복 키·그룹은 conflict, 속성·하위 그룹이 남은 그룹 삭제는 in_use 오류.
 */
export interface SystemSettingsApi {
  /** 그룹 목록 (코드 순) */
  listGroups(): Promise<SystemSettingGroup[]>;
  /** 그룹을 추가한다. 하위 그룹은 상위 그룹이 있어야 한다. */
  createGroup(group: SystemSettingGroup): Promise<void>;
  /** 그룹 이름·설명을 바꾼다. (코드는 바꿀 수 없다) */
  updateGroup(
    id: string,
    patch: Pick<SystemSettingGroup, "name" | "description">,
  ): Promise<void>;
  /** 그룹을 삭제한다. 속성·하위 그룹이 남아 있으면 in_use 오류. */
  deleteGroup(id: string): Promise<void>;
  /** 설정 목록 (키 순) */
  list(): Promise<SystemSetting[]>;
  /** 설정을 추가한다. */
  create(input: SystemSettingInput): Promise<void>;
  /** 설정 내용을 바꾼다. (키·그룹은 바꿀 수 없다) */
  update(
    key: string,
    input: Pick<
      SystemSettingInput,
      "name" | "description" | "type" | "value" | "options" | "access"
    >,
  ): Promise<void>;
  /** 여러 설정의 값만 한 번에 바꾼다. */
  updateValues(changes: SystemSettingChange[]): Promise<void>;
  /** 설정을 삭제한다. */
  remove(key: string): Promise<void>;
  /** 변경 이력을 검색한다. (최신순) */
  listHistories(
    query: SystemSettingHistoryQuery,
  ): Promise<SystemSettingHistoryPage>;
}

/** 백엔드 구현체가 지켜야 하는 계약 */
export interface Backend {
  readonly name: BackendName;
  readonly auth: AuthApi;
  readonly profile: ProfileApi;
  readonly systemSettings: SystemSettingsApi;
}
