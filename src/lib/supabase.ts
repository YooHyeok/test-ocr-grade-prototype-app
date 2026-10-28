import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** .env에 Supabase 접속 정보가 설정되어 있는지 여부. false면 앱은 설정 안내 화면을 표시한다. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Supabase 클라이언트 싱글톤.
 * 접속 정보가 없으면 앱이 import 시점에 죽지 않도록 로컬 기본 주소로 생성한다. (실제 요청은 하지 않음)
 */
const supabase = createClient<Database>(
  supabaseUrl || "http://127.0.0.1:54321",
  supabaseKey || "missing-publishable-key",
);

export default supabase;
