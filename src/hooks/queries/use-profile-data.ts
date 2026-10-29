import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/api/profile";
import { QUERY_KEYS } from "@/lib/constants";

/**
 * 사용자 프로필(권한, 소속 학원)을 조회한다. userId가 없으면 요청하지 않는다.
 * @param {string} [userId] - auth.users id
 * @returns {import("@tanstack/react-query").UseQueryResult<Awaited<ReturnType<typeof fetchProfile>>>}
 */
export function useProfileData(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId ?? ""),
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
  });
}
