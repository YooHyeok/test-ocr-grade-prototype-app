import RootRoute from "@/root-route";
import SessionProvider from "@/provider/session-provider";
import SetupNotice from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * 애플리케이션 루트 컴포넌트.
 * Supabase 접속 정보가 없으면 설정 안내를, 있으면 세션 확인 후 라우트를 렌더링한다.
 * @returns {JSX.Element}
 */
export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <SessionProvider>
      <RootRoute />
    </SessionProvider>
  );
}
