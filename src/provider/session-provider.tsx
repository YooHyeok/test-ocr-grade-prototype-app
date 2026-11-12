import { useCallback, useEffect, type ReactNode } from "react";
import GlobalLoader from "@/components/global-loader";
import ProfileErrorNotice from "@/components/profile-error-notice";
import { useProfileData } from "@/hooks/queries/use-profile-data";
import { backend } from "@/lib/backend";
import { useIsSessionLoaded, useSession, useSetSession } from "@/store/session";

type Props = {
  children: ReactNode;
};

/**
 * 로그인 세션을 구독해 스토어에 반영하고, 세션·프로필 확인이 끝날 때까지 로딩 화면을 보여준다.
 * (최초 마운트 직후에는 로컬 저장소의 세션이 아직 복원되지 않았으므로 바로 비로그인으로 판단하지 않는다)
 * 로그인 상태에서 프로필 조회가 실패하면 권한을 알 수 없으므로 안내 화면을 보여준다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SessionProvider({ children }: Readonly<Props>) {
  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useIsSessionLoaded();
  const {
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileData(session?.user.id);

  // 백엔드 종류와 무관하게, 구독 직후 현재 세션으로 한 번 호출되고 이후 변경 때마다 호출된다.
  useEffect(() => backend.auth.onSessionChange(setSession), [setSession]);

  const handleRetry = useCallback(() => {
    void refetchProfile();
  }, [refetchProfile]);

  if (!isSessionLoaded || isProfileLoading) return <GlobalLoader />;
  if (session && isProfileError)
    return <ProfileErrorNotice error={profileError} onRetry={handleRetry} />;
  return children;
}
