import {
  BackendError,
  type AuthSession,
  type Backend,
  type Profile,
} from "../types";

/** 개발·시연용 데모 계정 (백엔드 없이 화면을 확인할 때 사용) */
export const DEMO_ACCOUNTS: {
  email: string;
  password: string;
  profile: Profile;
}[] = [
  {
    email: "teacher@demo.com",
    password: "demo1234",
    profile: {
      id: "mock-teacher",
      role: "teacher",
      name: "전선생",
      academyId: "mock-academy",
      academyName: "라온 과학학원",
    },
  },
  {
    email: "student@demo.com",
    password: "demo1234",
    profile: {
      id: "mock-student",
      role: "student",
      name: "김학생",
      academyId: "mock-academy",
      academyName: "라온 과학학원",
    },
  },
];

const STORAGE_KEY = "mock-auth-session";

/**
 * 저장된 데모 세션을 읽는다.
 * @returns {AuthSession | null}
 */
function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

/**
 * 데모 세션을 저장하거나(null이면) 지운다.
 * @param {AuthSession | null} session - 세션
 * @returns {void}
 */
function writeSession(session: AuthSession | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없으면 새로고침 시 로그아웃된다.
  }
}

/**
 * 네트워크 없이 동작하는 데모 백엔드를 만든다. (데이터는 브라우저에만 저장)
 * @returns {Backend}
 */
export function createMockBackend(): Backend {
  const listeners = new Set<(session: AuthSession | null) => void>();
  let current = readSession();

  const setSession = (session: AuthSession | null) => {
    current = session;
    writeSession(session);
    listeners.forEach((listener) => listener(session));
  };

  return {
    name: "mock",

    auth: {
      async signInWithPassword({ email, password }) {
        const account = DEMO_ACCOUNTS.find(
          (item) => item.email === email.toLowerCase(),
        );
        if (!account || account.password !== password) {
          throw new BackendError(
            "invalid_credentials",
            "데모 계정 정보가 일치하지 않습니다.",
          );
        }
        const session: AuthSession = {
          user: { id: account.profile.id, email: account.email },
        };
        setSession(session);
        return session;
      },

      async signOut() {
        setSession(null);
      },

      onSessionChange(listener) {
        listeners.add(listener);
        queueMicrotask(() => listener(current));
        return () => listeners.delete(listener);
      },
    },

    profile: {
      async fetchById(userId) {
        const account = DEMO_ACCOUNTS.find(
          (item) => item.profile.id === userId,
        );
        if (!account)
          throw new BackendError(
            "not_found",
            "데모 프로필을 찾을 수 없습니다.",
          );
        return account.profile;
      },
    },
  };
}
