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

/** 백엔드 구현체가 지켜야 하는 계약 */
export interface Backend {
  readonly name: BackendName;
  readonly auth: AuthApi;
  readonly profile: ProfileApi;
}
