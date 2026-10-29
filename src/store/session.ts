import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type State = {
  /** 최초 세션 확인(로컬 저장소 복원)이 끝났는지 여부 */
  isLoaded: boolean;
  session: Session | null;
};

const initialState: State = {
  isLoaded: false,
  session: null,
};

const useSessionStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        setSession: (session: Session | null) =>
          set({ session, isLoaded: true }),
      },
    })),
    { name: "SessionStore" },
  ),
);

/**
 * 현재 로그인 세션을 반환한다. 로그아웃 상태면 null.
 * @returns {Session | null}
 */
export const useSession = () => {
  return useSessionStore((store) => store.session);
};

/**
 * 최초 세션 확인이 끝났는지 반환한다.
 * @returns {boolean}
 */
export const useIsSessionLoaded = () => {
  return useSessionStore((store) => store.isLoaded);
};

/**
 * 세션을 갱신하는 함수를 반환한다.
 * @returns {(session: Session | null) => void}
 */
export const useSetSession = () => {
  return useSessionStore((store) => store.actions.setSession);
};
