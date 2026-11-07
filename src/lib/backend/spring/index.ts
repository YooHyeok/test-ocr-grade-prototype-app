import type { AppConfig } from "@/lib/app-config";
import {
  BackendError,
  type AuthSession,
  type Backend,
  type Profile,
} from "../types";
import { createHttpClient } from "./http";

/** 로그인 응답 (POST /api/auth/login) */
type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string | null };
};

/** 브라우저에 저장하는 로그인 정보 */
type StoredAuth = LoginResponse;

const STORAGE_KEY = "spring-auth";

/**
 * 저장된 로그인 정보를 읽는다.
 * @returns {StoredAuth | null}
 */
function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

/**
 * 로그인 정보를 저장하거나(null이면) 지운다.
 * @param {StoredAuth | null} auth - 로그인 정보
 * @returns {void}
 */
function writeStoredAuth(auth: StoredAuth | null) {
  try {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리 상태만 사용한다.
  }
}

/**
 * Spring REST API 백엔드를 만든다.
 * 서버가 구현해야 하는 엔드포인트 계약은 docs/BACKEND.md 참고.
 * @param {AppConfig["spring"]} settings - API 주소
 * @returns {Backend}
 */
export function createSpringBackend(settings: AppConfig["spring"]): Backend {
  const request = createHttpClient(settings.baseUrl);
  const listeners = new Set<(session: AuthSession | null) => void>();
  let current: StoredAuth | null = readStoredAuth();

  const toSession = (auth: StoredAuth | null): AuthSession | null =>
    auth ? { user: auth.user } : null;

  const setAuth = (auth: StoredAuth | null) => {
    current = auth;
    writeStoredAuth(auth);
    listeners.forEach((listener) => listener(toSession(auth)));
  };

  /** 인증이 필요한 요청. 토큰이 만료(401)되면 로그아웃 상태로 전환한다. */
  const authorized = async <T>(
    path: string,
    options: Parameters<typeof request>[1] = {},
  ) => {
    try {
      return await request<T>(path, {
        ...options,
        token: current?.accessToken,
      });
    } catch (error) {
      if (error instanceof BackendError && error.code === "session_expired")
        setAuth(null);
      throw error;
    }
  };

  return {
    name: "spring",

    auth: {
      async signInWithPassword({ email, password }) {
        try {
          const auth = await request<LoginResponse>("/api/auth/login", {
            method: "POST",
            body: { email, password },
          });
          setAuth(auth);
          return { user: auth.user };
        } catch (error) {
          // 로그인 요청의 401은 "세션 만료"가 아니라 "계정 정보 불일치"다.
          if (
            error instanceof BackendError &&
            error.code === "session_expired"
          ) {
            throw new BackendError("invalid_credentials", error.message, error);
          }
          throw error;
        }
      },

      async signOut() {
        try {
          if (current)
            await request<void>("/api/auth/logout", {
              method: "POST",
              token: current.accessToken,
            });
        } finally {
          // 서버 요청이 실패해도 로컬 세션은 지운다.
          setAuth(null);
        }
      },

      onSessionChange(listener) {
        listeners.add(listener);
        // 다른 백엔드와 동일하게, 구독 직후 현재 세션을 비동기로 한 번 전달한다.
        queueMicrotask(() => listener(toSession(current)));
        return () => listeners.delete(listener);
      },
    },

    profile: {
      fetchById(userId) {
        return authorized<Profile>(
          `/api/profiles/${encodeURIComponent(userId)}`,
        );
      },
    },
  };
}
