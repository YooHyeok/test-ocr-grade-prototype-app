import { Navigate, Outlet } from "react-router";
import { useCurrentProfile } from "@/hooks/use-current-profile";

/**
 * 시스템 관리자 전용 영역. 관리자가 아니면 첫 화면으로 보낸다.
 * (화면만 막는 것이고, 실제 데이터 접근은 백엔드 권한(RLS 등)이 막는다)
 * @returns {JSX.Element}
 */
export default function AdminOnlyLayout() {
  const profile = useCurrentProfile();
  if (!profile?.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
