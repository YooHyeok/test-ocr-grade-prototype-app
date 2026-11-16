import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import type { MutationCallbacks } from "@/type";

/**
 * 시스템 설정 변경 mutation 공통 처리.
 * 성공·실패와 관계없이 설정·그룹·이력 캐시를 모두 다시 불러온다. (일부만 반영된 경우에도 실제 값이 보이도록)
 * @template TVariables 요청 값 타입
 * @param {(variables: TVariables) => Promise<void>} mutationFn - 백엔드 호출
 * @param {MutationCallbacks} [callbacks]
 * @returns {import("@tanstack/react-query").UseMutationResult<void, Error, TVariables>}
 */
export function useSystemSettingsMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  callbacks?: MutationCallbacks,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (error) => callbacks?.onError?.(error),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.systemSettings.all,
      });
      callbacks?.onSettled?.();
    },
  });
}
