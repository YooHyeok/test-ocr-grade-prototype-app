import { BackendError, type BackendErrorCode } from "@/lib/backend/types";

/** 공통 오류 코드별 한국어 안내 문구 (백엔드 종류와 무관) */
const ERROR_MESSAGE_MAP: Partial<Record<BackendErrorCode, string>> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  user_not_found: "해당 계정을 찾을 수 없습니다.",
  user_banned: "사용이 중지된 계정입니다. 학원에 문의해주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
  email_not_confirmed: "이메일 인증이 필요합니다.",
  invalid_email: "이메일 주소가 올바르게 입력되지 않았습니다.",
  rate_limited: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  not_found: "요청한 정보를 찾을 수 없습니다.",
  not_implemented: "아직 지원하지 않는 기능입니다.",
};

/**
 * 오류 객체를 사용자에게 보여줄 한국어 메시지로 바꾼다.
 * @param {unknown} error - 발생한 오류
 * @returns {string} 안내 문구
 */
export function getErrorMessage(error: unknown) {
  if (error instanceof BackendError) {
    return (
      ERROR_MESSAGE_MAP[error.code] ??
      "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    );
  }
  return "문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
