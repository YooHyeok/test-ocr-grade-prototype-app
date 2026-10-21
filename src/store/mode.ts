import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import type { Mode } from "@/type";

type State = {
  mode: Mode;
};

const initialState: State = {
  mode: "teacher",
};

const useModeStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setMode: (mode: Mode) => set({ mode }),
      },
    })),
    { name: "ModeStore" },
  ),
);

/**
 * 사용자가 선택한 화면 모드를 반환한다. (뷰포트 보정 전 값 — 화면에서는 useCurrentMode 사용)
 * @returns {Mode}
 */
export const useMode = () => {
  return useModeStore((store) => store.mode);
};

/**
 * 화면 모드를 변경하는 함수를 반환한다.
 * @returns {(mode: Mode) => void}
 */
export const useSetMode = () => {
  return useModeStore((store) => store.actions.setMode);
};
