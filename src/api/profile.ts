import supabase from "@/lib/supabase";

/**
 * 사용자 프로필(권한, 이름)과 소속 학원 이름을 조회한다.
 * 프로필은 가입 시 DB 트리거로 자동 생성된다. (supabase/migrations)
 * @param {string} userId - auth.users id
 * @returns {Promise<{ id: string, academy_id: string | null, role: "teacher" | "student", name: string, created_at: string, academy: { name: string } | null }>}
 */
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, academy:academies(name)")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}
