import { Navigate, Outlet } from "react-router";
import { useSession } from "@/store/session";

/**
 * 로그인 사용자 전용 영역. 로그인하지 않았다면 로그인 화면으로 보낸다.
 * @returns {JSX.Element}
 */
export default function MemberOnlyLayout() {
  const session = useSession();
  if (!session) return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}
