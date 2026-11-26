/**
 * 브라우저에서 호출하는 서버 함수(account-admin, auth-login) 공용 응답·환경 도구.
 */

/** 브라우저 호출 허용 (supabase-js functions.invoke가 보내는 헤더) */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * JSON 응답을 만든다. (CORS 헤더 포함)
 * @param {number} status - HTTP 상태 코드
 * @param {unknown} body - 응답 본문
 * @returns {Response}
 */
export function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

/**
 * 공통 오류 응답. 프론트는 code로 오류를 구분한다. (src/lib/backend/types.ts BackendErrorCode)
 * @param {number} status - HTTP 상태 코드
 * @param {string} code - 공통 오류 코드
 * @param {string} message - 개발자용 메시지
 * @param {Record<string, unknown>} [extra] - 추가 정보 (남은 시도 횟수 등)
 * @returns {Response}
 */
export function fail(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
) {
  return json(status, { code, message, ...extra });
}

/**
 * 비밀값(환경 변수)을 읽는다. 없으면 오류.
 * @param {string} name - 이름
 * @returns {string}
 */
export function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`비밀값 ${name}이(가) 설정되지 않았습니다.`);
  return value;
}

/**
 * 0 이상 max 미만 정수를 암호학적 난수로 고른다. (나머지 편향 없이)
 * @param {number} max - 상한 (제외)
 * @returns {number}
 */
export function secureRandomInt(max: number) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do crypto.getRandomValues(buffer);
  while (buffer[0] >= limit);
  return buffer[0] % max;
}
