import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useSetMode } from "@/store/mode";
import { HOME_BY_MODE } from "@/lib/menu";
import type { Mode } from "@/type";

/**
 * 화면 모드를 바꾸고 해당 모드의 첫 화면으로 이동하는 함수를 반환한다.
 * @returns {(next: Mode) => void}
 */
export function useSwitchMode() {
  const setMode = useSetMode();
  const navigate = useNavigate();

  return useCallback(
    (next: Mode) => {
      setMode(next);
      navigate(HOME_BY_MODE[next]);
    },
    [setMode, navigate],
  );
}
