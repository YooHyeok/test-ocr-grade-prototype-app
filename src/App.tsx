import RootRoute from "@/root-route";
import SessionProvider from "@/provider/session-provider";
import SetupNotice from "@/components/setup-notice";
import { isBackendConfigured } from "@/lib/app-config";

/**
 * 애플리케이션 루트 컴포넌트.
 * 선택한 백엔드(public/config.js)의 접속 정보가 없으면 설정 안내를, 있으면 세션 확인 후 라우트를 렌더링한다.
 * @returns {JSX.Element}
 */
export default function App() {
  if (!isBackendConfigured()) return <SetupNotice />;

  return (
    <SessionProvider>
      <RootRoute />
    </SessionProvider>
  );
}
