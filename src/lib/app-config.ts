/** 지원하는 백엔드 종류 */
export type BackendName = "supabase" | "spring" | "mock";

/** 앱 전체에서 사용하는 최종 설정 (public/config.js → .env 순으로 채움) */
export type AppConfig = {
  backend: BackendName;
  supabase: { url: string; publishableKey: string };
  spring: { baseUrl: string };
};

const BACKENDS = new Set<string>(["supabase", "spring", "mock"]);

/** public/config.js가 로드되지 않았어도 앱이 죽지 않도록 안전하게 읽는다. */
const runtime = typeof config === "undefined" ? undefined : config;

/**
 * 백엔드 이름을 검증한다. 알 수 없는 값이면 기본값(supabase)을 쓴다.
 * @param {string | undefined} value - 설정값
 * @returns {BackendName}
 */
function resolveBackend(value: string | undefined): BackendName {
  return value && BACKENDS.has(value) ? (value as BackendName) : "supabase";
}

/**
 * 주소 끝의 "/"를 제거해 "/api/..." 경로와 바로 이어 붙일 수 있게 한다.
 * @param {string} url - API 주소
 * @returns {string}
 */
function trimTrailingSlash(url: string) {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") end--;
  return url.slice(0, end);
}

export const appConfig: AppConfig = {
  backend: resolveBackend(runtime?.backend),
  supabase: {
    url: runtime?.supabase?.url || import.meta.env.VITE_SUPABASE_URL || "",
    publishableKey:
      runtime?.supabase?.publishableKey ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "",
  },
  spring: {
    baseUrl: trimTrailingSlash(
      runtime?.spring?.baseUrl || import.meta.env.VITE_SPRING_API_URL || "",
    ),
  },
};

/**
 * 선택한 백엔드의 접속 정보가 채워져 있는지 확인한다. false면 앱은 설정 안내 화면을 보여준다.
 * @param {AppConfig} [target] - 확인할 설정 (기본: 현재 앱 설정)
 * @returns {boolean}
 */
export function isBackendConfigured(target: AppConfig = appConfig) {
  switch (target.backend) {
    case "mock":
      return true;
    case "spring":
      return Boolean(target.spring.baseUrl);
    case "supabase":
      return Boolean(target.supabase.url && target.supabase.publishableKey);
  }
}
