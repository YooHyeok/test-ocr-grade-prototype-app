import { Navigate, Outlet } from "react-router";
import { useSession } from "@/store/session";

/**
 * 비로그인 사용자 전용 영역 (로그인 화면). 이미 로그인했다면 홈으로 보낸다.
 * @returns {JSX.Element}
 */
export default function GuestOnlyLayout() {
  const session = useSession();
  if (session) return <Navigate to="/" replace />;
  return <Outlet />;
}
