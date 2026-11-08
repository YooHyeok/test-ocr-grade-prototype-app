import { backend } from "@/lib/backend";

/**
 * 이메일·비밀번호로 로그인한다. (실제 처리는 설정된 백엔드 구현체가 담당)
 * 계정은 학원 관리자가 생성해 전달하는 방식을 전제로 하며, 회원가입 화면은 기획 확정 후 추가한다.
 * @param {object} params
 * @param {string} params.email - 이메일
 * @param {string} params.password - 비밀번호
 * @returns {Promise<import("@/lib/backend/types").AuthSession>}
 */
export function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return backend.auth.signInWithPassword({ email, password });
}

/**
 * 로그아웃한다. 서버 요청이 실패해도 로컬 세션은 지운다.
 * @returns {Promise<void>}
 */
export function signOut() {
  return backend.auth.signOut();
}
