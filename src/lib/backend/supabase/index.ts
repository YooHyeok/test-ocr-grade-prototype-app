import { AuthError, createClient, type Session } from "@supabase/supabase-js";
import type { Database } from "@/database.types";
import type { AppConfig } from "@/lib/app-config";
import {
  BackendError,
  type AuthSession,
  type Backend,
  type BackendErrorCode,
  type Profile,
  type SystemSetting,
  type SystemSettingHistory,
  type SystemSettingInput,
} from "../types";
import {
  CHOICE_TYPES,
  OPTION_SEPARATOR,
  kstDayRange,
} from "@/lib/system-settings";

/** Postgres 오류 코드 → 공통 오류 코드 */
const DB_ERROR_CODE_MAP: Record<string, BackendErrorCode> = {
  PGRST116: "not_found",
  "42501": "forbidden", // 권한 없음 (허용되지 않은 컬럼 수정 등)
  "23514": "invalid_value", // check 제약 위반
  "22P02": "invalid_value", // 형식이 맞지 않는 값
  "23505": "conflict", // 중복 키
  "23503": "in_use", // 참조 중 (속성이 남은 그룹 삭제 등)
};

type SettingRow = Database["public"]["Tables"]["system_settings"]["Row"];

/**
 * system_settings 행을 도메인 타입으로 바꾼다.
 * @param {SettingRow} row - DB 행
 * @returns {SystemSetting}
 */
function toSystemSetting(row: SettingRow): SystemSetting {
  return {
    id: row.prop_id,
    key: row.prop_key,
    groupId: row.prop_grp,
    subGroupId: row.prop_sub_grp,
    name: row.prop_name,
    description: row.prop_desc,
    type: row.prop_type,
    value: row.prop_val,
    options:
      row.prop_spr_type && row.prop_spr_val
        ? row.prop_spr_val.split(row.prop_spr_type)
        : null,
    access: row.prop_usr_rgh,
  };
}

/**
 * 설정 입력 중 수정 가능한 항목을 system_settings 컬럼 값으로 바꾼다. 빈 값은 null로 저장한다.
 * 선택지는 선택형(RADIO·SEL·CHECK)만 저장한다.
 * @param {Pick<SystemSettingInput, "name" | "description" | "type" | "value" | "options" | "access">} input
 * @returns {object} 컬럼 값
 */
function toEditableColumns(
  input: Pick<
    SystemSettingInput,
    "name" | "description" | "type" | "value" | "options" | "access"
  >,
) {
  const choice = CHOICE_TYPES.has(input.type);
  return {
    prop_name: input.name,
    prop_desc: input.description,
    prop_type: input.type,
    prop_val: input.value || null,
    prop_spr_type: choice ? OPTION_SEPARATOR : null,
    prop_spr_val: choice ? (input.options ?? []).join(OPTION_SEPARATOR) : null,
    prop_usr_rgh: input.access,
  };
}

/**
 * 수정·삭제 결과가 0건이면(없거나 권한 없음) not_found 오류를 던진다.
 * @param {unknown[] | null} rows - 반환된 행
 * @param {string} target - 대상 설명 (오류 메시지용)
 * @returns {void}
 */
function assertAffected(rows: unknown[] | null, target: string) {
  if (!rows || rows.length === 0)
    throw new BackendError(
      "not_found",
      `${target}을(를) 찾을 수 없거나 권한이 없습니다.`,
    );
}

/** Supabase 인증 오류 코드 → 공통 오류 코드 */
const AUTH_ERROR_CODE_MAP: Record<string, BackendErrorCode> = {
  invalid_credentials: "invalid_credentials",
  user_not_found: "user_not_found",
  user_banned: "user_banned",
  session_expired: "session_expired",
  refresh_token_not_found: "session_expired",
  email_not_confirmed: "email_not_confirmed",
  email_address_invalid: "invalid_email",
  validation_failed: "invalid_email",
  over_request_rate_limit: "rate_limited",
};

/**
 * Supabase 오류를 공통 오류로 바꾼다.
 * @param {unknown} error - Supabase 오류
 * @returns {BackendError}
 */
function toBackendError(error: unknown) {
  if (error instanceof AuthError) {
    return new BackendError(
      (error.code && AUTH_ERROR_CODE_MAP[error.code]) || "unknown",
      error.message,
      error,
    );
  }
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    typeof error.code === "string" &&
    DB_ERROR_CODE_MAP[error.code]
  ) {
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : error.code;
    return new BackendError(DB_ERROR_CODE_MAP[error.code], message, error);
  }
  return new BackendError(
    "unknown",
    error instanceof Error ? error.message : String(error),
    error,
  );
}

/**
 * Supabase 세션을 공통 세션으로 바꾼다.
 * @param {Session} session - Supabase 세션
 * @returns {AuthSession}
 */
function toAuthSession(session: Session): AuthSession {
  return { user: { id: session.user.id, email: session.user.email ?? null } };
}

/**
 * Supabase 백엔드를 만든다. 스키마·권한(RLS)은 supabase/migrations 참고.
 * 접속 정보가 비어 있어도 import 시점에 죽지 않도록 로컬 기본 주소로 생성한다. (App에서 설정 안내 화면 표시)
 * @param {AppConfig["supabase"]} settings - 접속 정보
 * @returns {Backend}
 */
export function createSupabaseBackend(
  settings: AppConfig["supabase"],
): Backend {
  const client = createClient<Database>(
    settings.url || "http://127.0.0.1:54321",
    settings.publishableKey || "missing-publishable-key",
  );

  return {
    name: "supabase",

    auth: {
      async signInWithPassword({ email, password }) {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw toBackendError(error);
        return toAuthSession(data.session);
      },

      async signOut() {
        const { error } = await client.auth.signOut();
        // 서버 요청이 실패해도 로컬 세션은 지운다.
        if (error) await client.auth.signOut({ scope: "local" });
      },

      onSessionChange(listener) {
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          listener(session ? toAuthSession(session) : null);
        });
        return () => data.subscription.unsubscribe();
      },
    },

    profile: {
      async fetchById(userId): Promise<Profile> {
        const { data, error } = await client
          .from("profiles")
          .select(
            "id, role, name, is_admin, academy_id, academy:academies(name)",
          )
          .eq("id", userId)
          .single();

        if (error) throw toBackendError(error);
        return {
          id: data.id,
          role: data.role,
          name: data.name,
          academyId: data.academy_id,
          academyName: data.academy?.name ?? null,
          isAdmin: data.is_admin,
        };
      },
    },

    // 시스템 관리자만 조회·변경할 수 있다. (RLS: …_system_settings.sql) 변경 이력은 DB 트리거가 남긴다.
    systemSettings: {
      async listGroups() {
        const { data, error } = await client
          .from("system_setting_groups")
          .select("prop_grp_id, prop_grp_nm, prop_grp_desc")
          .order("prop_grp_id");
        if (error) throw toBackendError(error);
        return data.map((row) => ({
          id: row.prop_grp_id,
          name: row.prop_grp_nm,
          description: row.prop_grp_desc,
        }));
      },

      async createGroup(group) {
        const { error } = await client.from("system_setting_groups").insert({
          prop_grp_id: group.id,
          prop_grp_nm: group.name,
          prop_grp_desc: group.description,
        });
        if (error) throw toBackendError(error);
      },

      async updateGroup(id, patch) {
        const { data, error } = await client
          .from("system_setting_groups")
          .update({ prop_grp_nm: patch.name, prop_grp_desc: patch.description })
          .eq("prop_grp_id", id)
          .select("prop_grp_id");
        if (error) throw toBackendError(error);
        assertAffected(data, `그룹(${id})`);
      },

      async deleteGroup(id) {
        const { data, error } = await client
          .from("system_setting_groups")
          .delete()
          .eq("prop_grp_id", id)
          .select("prop_grp_id");
        if (error) throw toBackendError(error);
        assertAffected(data, `그룹(${id})`);
      },

      async list() {
        const { data, error } = await client
          .from("system_settings")
          .select("*")
          .order("prop_key");
        if (error) throw toBackendError(error);
        return data.map(toSystemSetting);
      },

      async create(input) {
        const { error } = await client.from("system_settings").insert({
          prop_key: input.key,
          prop_grp: input.groupId,
          prop_sub_grp: input.subGroupId,
          ...toEditableColumns(input),
        });
        if (error) throw toBackendError(error);
      },

      async update(key, input) {
        const { data, error } = await client
          .from("system_settings")
          .update(toEditableColumns(input))
          .eq("prop_key", key)
          .select("prop_key");
        if (error) throw toBackendError(error);
        assertAffected(data, `설정(${key})`);
      },

      async updateValues(changes) {
        // 설정마다 한 건씩 수정한다. 실패하면 앞서 저장된 값은 그대로 두고 오류를 던진다.
        for (const change of changes) {
          const { data, error } = await client
            .from("system_settings")
            .update({ prop_val: change.value || null })
            .eq("prop_key", change.key)
            .select("prop_key");
          if (error) throw toBackendError(error);
          assertAffected(data, `설정(${change.key})`);
        }
      },

      async remove(key) {
        const { data, error } = await client
          .from("system_settings")
          .delete()
          .eq("prop_key", key)
          .select("prop_key");
        if (error) throw toBackendError(error);
        assertAffected(data, `설정(${key})`);
      },

      async listHistories(query) {
        let request = client
          .from("system_setting_histories")
          .select("*", { count: "exact" })
          .order("reg_dt", { ascending: false });
        if (query.date) {
          // reg_dt는 시간대 없는 UTC 시각이므로 끝의 Z를 떼고 비교한다.
          const { from, to } = kstDayRange(query.date);
          request = request
            .gte("reg_dt", from.replace("Z", ""))
            .lt("reg_dt", to.replace("Z", ""));
        }
        if (query.groupId) request = request.eq("sys_group_id", query.groupId);
        if (query.key.trim())
          request = request.ilike("prop_key", `%${query.key.trim()}%`);

        const start = (query.page - 1) * query.pageSize;
        const { data, error, count } = await request.range(
          start,
          start + query.pageSize - 1,
        );
        if (error) throw toBackendError(error);
        const items: SystemSettingHistory[] = data.map((row) => ({
          id: row.hist_id,
          key: row.prop_key,
          name: row.prop_name,
          groupId: row.sys_group_id,
          groupName: row.sys_group_name,
          action: row.prop_action ?? "U",
          prevValue: row.prev_value,
          nowValue: row.now_value,
          // timestamp(시간대 없음) 컬럼이므로 UTC로 해석한다.
          changedAt: row.reg_dt ? `${row.reg_dt.replace(" ", "T")}Z` : null,
          changedBy: row.reg_name,
        }));
        return { items, total: count ?? items.length };
      },
    },
  };
}
