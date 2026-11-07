import { AuthError, createClient, type Session } from "@supabase/supabase-js";
import type { Database } from "@/database.types";
import type { AppConfig } from "@/lib/app-config";
import {
  BackendError,
  type AuthSession,
  type Backend,
  type BackendErrorCode,
  type Profile,
} from "../types";

/** Supabase 인증 오류 코드 → 공통 오류 코드 */
const AUTH_ERROR_CODE_MAP: Record<string, BackendErrorCode> = {
  invalid_credentials: "invalid_credentials",
  user_not_found: "user_not_found",
  user_banned: "user_banned",
  session_expired: "session_expired",
  refresh_token_not_found: "session_expired",
  email_not_confirmed: "email_not_confirmed",
  email_address_invalid: "invalid_email",
  validation_failed: "invalid_email",
  over_request_rate_limit: "rate_limited",
};

/**
 * Supabase 오류를 공통 오류로 바꾼다.
 * @param {unknown} error - Supabase 오류
 * @returns {BackendError}
 */
function toBackendError(error: unknown) {
  if (error instanceof AuthError) {
    return new BackendError(
      (error.code && AUTH_ERROR_CODE_MAP[error.code]) || "unknown",
      error.message,
      error,
    );
  }
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "PGRST116"
  ) {
    return new BackendError("not_found", "데이터를 찾을 수 없습니다.", error);
  }
  return new BackendError(
    "unknown",
    error instanceof Error ? error.message : String(error),
    error,
  );
}

/**
 * Supabase 세션을 공통 세션으로 바꾼다.
 * @param {Session} session - Supabase 세션
 * @returns {AuthSession}
 */
function toAuthSession(session: Session): AuthSession {
  return { user: { id: session.user.id, email: session.user.email ?? null } };
}

/**
 * Supabase 백엔드를 만든다. 스키마·권한(RLS)은 supabase/migrations 참고.
 * 접속 정보가 비어 있어도 import 시점에 죽지 않도록 로컬 기본 주소로 생성한다. (App에서 설정 안내 화면 표시)
 * @param {AppConfig["supabase"]} settings - 접속 정보
 * @returns {Backend}
 */
export function createSupabaseBackend(
  settings: AppConfig["supabase"],
): Backend {
  const client = createClient<Database>(
    settings.url || "http://127.0.0.1:54321",
    settings.publishableKey || "missing-publishable-key",
  );

  return {
    name: "supabase",

    auth: {
      async signInWithPassword({ email, password }) {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw toBackendError(error);
        return toAuthSession(data.session);
      },

      async signOut() {
        const { error } = await client.auth.signOut();
        // 서버 요청이 실패해도 로컬 세션은 지운다.
        if (error) await client.auth.signOut({ scope: "local" });
      },

      onSessionChange(listener) {
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          listener(session ? toAuthSession(session) : null);
        });
        return () => data.subscription.unsubscribe();
      },
    },

    profile: {
      async fetchById(userId): Promise<Profile> {
        const { data, error } = await client
          .from("profiles")
          .select("id, role, name, academy_id, academy:academies(name)")
          .eq("id", userId)
          .single();

        if (error) throw toBackendError(error);
        return {
          id: data.id,
          role: data.role,
          name: data.name,
          academyId: data.academy_id,
          academyName: data.academy?.name ?? null,
        };
      },
    },
  };
}
