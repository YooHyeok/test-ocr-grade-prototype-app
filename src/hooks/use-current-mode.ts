import { useCurrentProfile } from "@/hooks/use-current-profile";
import type { Mode } from "@/type";

/**
 * 계정 권한에 따른 화면 모드를 반환한다. 프로필을 확인할 수 없으면 권한이 가장 낮은 학생 모드로 본다.
 * @returns {Mode}
 */
export function useCurrentMode(): Mode {
  const profile = useCurrentProfile();
  return profile?.role === "teacher" ? "teacher" : "student";
}
