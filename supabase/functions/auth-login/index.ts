/**
 * 로그인 서버 함수 (Supabase Edge Function, Deno). 비밀번호 5회 연속 실패 시 계정을 잠근다. (관리자 제외)
 *
 * 호출: POST { "email", "password" } (로그인 전이라 토큰 없음)
 *   → 200 { access_token, refresh_token }  프론트는 supabase.auth.setSession으로 세션을 넣는다.
 *   → 401 { code: "invalid_credentials", remainingAttempts }  남은 시도 횟수 (관리자·없는 계정은 null)
 *   → 423 { code: "account_locked" }  잠긴 계정 (5회째 실패 포함)
 * 잠금 해제: 사용자 관리 화면 → account-admin { action: "unlock" }
 *
 * 한계: Supabase 인증 주소를 직접 호출하면 이 함수를 건너뛸 수 있다. 잠긴 계정은 DB 권한 규칙으로
 *       학원 데이터가 보이지 않으므로(current_academy_id) 데이터는 막힌다. (설계 문서 5절)
 *
 * 비밀값: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (Supabase가 자동 제공)
 * 배포: npx supabase functions deploy auth-login --no-verify-jwt
 */
import { createClient } from "@supabase/supabase-js";
import { CORS_HEADERS, fail, json, requireEnv } from "../_shared/http.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== "POST")
    return fail(405, "invalid_value", "POST만 허용합니다.");

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password)
    return fail(400, "invalid_credentials", "이메일과 비밀번호를 입력해주세요.");

  const url = requireEnv("SUPABASE_URL");
  const service = createClient(url, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(url, requireEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: locked } = await service.rpc("is_login_locked", {
    p_email: email,
  });
  if (locked)
    return fail(423, "account_locked", "로그인 잠금 계정입니다.");

  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    if (error?.code === "invalid_credentials") {
      const { data: left } = await service.rpc("record_login_failure", {
        p_email: email,
      });
      if (left === 0)
        return fail(423, "account_locked", "비밀번호를 5회 틀려 잠겼습니다.");
      return fail(401, "invalid_credentials", "계정 정보가 일치하지 않습니다.", {
        remainingAttempts: left ?? null,
      });
    }
    return fail(400, error?.code ?? "unknown", error?.message ?? "로그인하지 못했습니다.");
  }

  await service.rpc("reset_login_failures", { p_email: email });
  return json(200, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});
