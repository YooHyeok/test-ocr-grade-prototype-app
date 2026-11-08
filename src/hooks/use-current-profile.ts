import { useProfileData } from "@/hooks/queries/use-profile-data";
import { useSession } from "@/store/session";

/**
 * 로그인 사용자의 프로필(권한, 이름, 소속 학원)을 반환한다.
 * SessionProvider가 프로필 로딩을 마친 뒤 렌더링하므로 캐시된 값을 바로 사용한다.
 * @returns {import("@/lib/backend/types").Profile | undefined}
 */
export function useCurrentProfile() {
  const session = useSession();
  const { data: profile } = useProfileData(session?.user.id);
  return profile;
}
