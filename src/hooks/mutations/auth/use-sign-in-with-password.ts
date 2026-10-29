import { useMutation } from "@tanstack/react-query";
import { signInWithPassword } from "@/api/auth";
import type { MutationCallbacks } from "@/type";

/**
 * 이메일·비밀번호 로그인 mutation.
 * 성공 시 세션은 SessionProvider의 onAuthStateChange로 갱신되므로 별도 처리가 필요 없다.
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult}
 */
export function useSignInWithPassword(callbacks?: MutationCallbacks) {
  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (error) => callbacks?.onError?.(error),
  });
}
