import { Navigate, Outlet } from "react-router";
import { useCurrentMode } from "@/hooks/use-current-mode";
import { HOME_BY_MODE } from "@/lib/menu";
import type { Mode } from "@/type";

type Props = {
  /** 이 영역에 접근할 수 있는 모드 */
  mode: Mode;
};

/**
 * 모드(선생님/학생) 전용 영역. 다른 모드의 화면 주소로 들어오면 자기 모드의 첫 화면으로 보낸다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function RoleOnlyLayout({ mode }: Readonly<Props>) {
  const currentMode = useCurrentMode();
  if (currentMode !== mode)
    return <Navigate to={HOME_BY_MODE[currentMode]} replace />;
  return <Outlet />;
}
