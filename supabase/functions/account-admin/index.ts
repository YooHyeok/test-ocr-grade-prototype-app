/**
 * 계정 관리 서버 함수 (Supabase Edge Function, Deno). 사용자 관리 화면에서 호출한다.
 *
 * 호출: POST, 헤더 Authorization: Bearer <로그인 사용자 토큰>
 *   { "action": "create_user", "input": { role, name, email, grade, classId, phone } }
 *       → 200 { userId, tempPassword }  임시 비밀번호는 이 응답에서만 한 번 보여준다.
 *   { "action": "unlock", "profileId": "..." }
 *       → 204  로그인 잠금 해제·실패 횟수 초기화
 * 권한: 관리자는 같은 학원 선생님·학생, 선생님은 같은 학원 학생만. (규칙: _shared/account-rules.ts)
 * 실패: { code, message } — 401 session_expired / 403 forbidden / 400 invalid_value / 404 not_found / 409 conflict
 *
 * 비밀값: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (Supabase가 자동 제공)
 * 배포: npx supabase functions deploy account-admin
 */
import { createClient } from "@supabase/supabase-js";
import {
  checkCanManage,
  generateTempPassword,
  validateCreateAccount,
  type AccountActor,
  type CreateAccountInput,
} from "../_shared/account-rules.ts";
import {
  CORS_HEADERS,
  fail,
  json,
  requireEnv,
  secureRandomInt,
} from "../_shared/http.ts";

type Body =
  | { action: "create_user"; input: CreateAccountInput }
  | { action: "unlock"; profileId: string };

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== "POST")
    return fail(405, "invalid_value", "POST만 허용합니다.");

  const admin = createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // 요청한 사람 확인
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return fail(401, "session_expired", "로그인이 필요합니다.");
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user)
    return fail(401, "session_expired", "로그인이 만료되었습니다.");
  const { data: me } = await admin
    .from("profiles")
    .select("role, is_admin, academy_id, locked_at")
    .eq("id", userData.user.id)
    .single();
  if (!me) return fail(403, "forbidden", "프로필이 없습니다.");
  const actor: AccountActor = {
    role: me.role,
    isAdmin: me.is_admin,
    academyId: me.academy_id,
    locked: me.locked_at !== null,
  };

  const body = (await request.json().catch(() => null)) as Body | null;

  if (body?.action === "create_user") {
    const input = body.input;
    const problem =
      validateCreateAccount(input) ?? checkCanManage(actor, input.role);
    if (problem)
      return fail(problem.code === "forbidden" ? 403 : 400, problem.code, problem.message);
    if (input.role === "student") {
      const { data: found } = await admin
        .from("classes")
        .select("id")
        .eq("id", input.classId)
        .eq("academy_id", actor.academyId)
        .maybeSingle();
      if (!found) return fail(400, "invalid_value", "배정할 수 없는 클래스입니다.");
    }

    const email = input.email.trim().toLowerCase();
    const tempPassword = generateTempPassword(secureRandomInt);
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: input.name.trim(), phone: input.phone ?? "" },
      });
    if (createError || !created.user) {
      const exists =
        createError?.code === "email_exists" ||
        /already/i.test(createError?.message ?? "");
      return exists
        ? fail(409, "conflict", "이미 가입한 이메일입니다.")
        : fail(500, "unknown", createError?.message ?? "계정을 만들지 못했습니다.");
    }

    // 가입 트리거가 만든 프로필에 학원·권한을 넣는다. 실패하면 만든 계정을 지운다.
    const userId = created.user.id;
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        academy_id: actor.academyId,
        role: input.role,
        must_change_password: true,
        phone: input.phone,
      })
      .eq("id", userId);
    const { error: rosterError } =
      input.role === "student" && !profileError
        ? await admin.from("students").insert({
            academy_id: actor.academyId,
            class_id: input.classId,
            profile_id: userId,
            name: input.name.trim(),
            grade: input.grade,
          })
        : { error: null };
    if (profileError || rosterError) {
      await admin.auth.admin.deleteUser(userId);
      return fail(500, "unknown", (profileError ?? rosterError)!.message);
    }
    return json(200, { userId, tempPassword });
  }

  if (body?.action === "unlock") {
    const { data: target } = await admin
      .from("profiles")
      .select("role, academy_id")
      .eq("id", body.profileId)
      .maybeSingle();
    if (!target || target.academy_id !== actor.academyId)
      return fail(404, "not_found", "계정을 찾을 수 없습니다.");
    const problem = checkCanManage(actor, target.role);
    if (problem) return fail(403, problem.code, problem.message);
    const { error } = await admin
      .from("profiles")
      .update({ locked_at: null, failed_login_count: 0 })
      .eq("id", body.profileId);
    if (error) return fail(500, "unknown", error.message);
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  return fail(400, "invalid_value", "알 수 없는 요청입니다.");
});
