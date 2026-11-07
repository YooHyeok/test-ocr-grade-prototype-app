import { BackendError, type BackendErrorCode } from "../types";

/** HTTP 상태 코드 → 공통 오류 코드 (응답 본문에 code가 없을 때 사용) */
const STATUS_CODE_MAP: Record<number, BackendErrorCode> = {
  401: "session_expired",
  403: "user_banned",
  404: "not_found",
  429: "rate_limited",
};

const KNOWN_CODES = new Set<string>([
  "invalid_credentials",
  "user_not_found",
  "user_banned",
  "session_expired",
  "email_not_confirmed",
  "invalid_email",
  "rate_limited",
  "not_found",
]);

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Authorization 헤더에 넣을 액세스 토큰 */
  token?: string | null;
};

/**
 * 실패 응답을 공통 오류로 바꾼다.
 * Spring 서버는 실패 시 { code, message } 형태의 본문을 내려주는 것을 권장한다. (docs/BACKEND.md)
 * @param {Response} response - 실패 응답
 * @returns {Promise<BackendError>}
 */
async function toBackendError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    code?: string;
    message?: string;
  } | null;
  const code: BackendErrorCode =
    body?.code && KNOWN_CODES.has(body.code)
      ? (body.code as BackendErrorCode)
      : (STATUS_CODE_MAP[response.status] ?? "unknown");
  return new BackendError(code, body?.message ?? `HTTP ${response.status}`, {
    status: response.status,
    body,
  });
}

/**
 * Spring REST API 호출 함수를 만든다.
 * @param {string} baseUrl - API 주소 (끝 / 없이)
 * @returns {<T>(path: string, options?: RequestOptions) => Promise<T>}
 */
export function createHttpClient(baseUrl: string) {
  return async function request<T>(
    path: string,
    { method = "GET", body, token }: RequestOptions = {},
  ): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      throw new BackendError("unknown", "서버에 연결할 수 없습니다.", error);
    }

    if (!response.ok) throw await toBackendError(response);
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  };
}
