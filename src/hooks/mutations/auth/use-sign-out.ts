import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "@/api/auth";
import type { MutationCallbacks } from "@/type";

/**
 * 로그아웃 mutation. 다른 계정의 데이터가 남지 않도록 캐시를 비운다.
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useSignOut(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}
