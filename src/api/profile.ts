import { backend } from "@/lib/backend";

/**
 * 사용자 프로필(권한, 이름, 소속 학원)을 조회한다. (실제 처리는 설정된 백엔드 구현체가 담당)
 * @param {string} userId - 사용자 id
 * @returns {Promise<import("@/lib/backend/types").Profile>}
 */
export function fetchProfile(userId: string) {
  return backend.profile.fetchById(userId);
}
