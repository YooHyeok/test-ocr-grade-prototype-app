import supabase from "@/lib/supabase";

/**
 * 이메일·비밀번호로 로그인한다.
 * 계정은 학원 관리자가 생성해 전달하는 방식을 전제로 하며, 회원가입 화면은 기획 확정 후 추가한다.
 * @param {object} params
 * @param {string} params.email - 이메일
 * @param {string} params.password - 비밀번호
 * @returns {Promise<import("@supabase/supabase-js").AuthTokenResponsePassword["data"]>}
 */
export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * 로그아웃한다. 서버 요청이 실패해도 로컬 세션은 지운다.
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) await supabase.auth.signOut({ scope: "local" });
}
