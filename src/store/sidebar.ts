import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";

type State = {
  isCollapsed: boolean;
};

const initialState: State = {
  isCollapsed: false,
};

const useSidebarStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
        },
      })),
      {
        name: "SidebarStore",
        partialize: (store) => ({ isCollapsed: store.isCollapsed }),
      },
    ),
    { name: "SidebarStore" },
  ),
);

/**
 * 사이드바 접힘 여부(사용자 토글 기준)를 반환한다.
 * @returns {boolean}
 */
export const useIsSidebarCollapsed = () => {
  return useSidebarStore((store) => store.isCollapsed);
};

/**
 * 사이드바 접힘 상태를 토글하는 함수를 반환한다.
 * @returns {() => void}
 */
export const useToggleSidebar = () => {
  return useSidebarStore((store) => store.actions.toggle);
};
