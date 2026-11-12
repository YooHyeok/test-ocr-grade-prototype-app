import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";

type Props = {
  error: unknown;
  onRetry: () => void;
};

/**
 * 로그인은 됐지만 프로필(권한·소속 학원)을 불러오지 못했을 때 표시하는 안내 화면.
 * 권한을 모르는 채로 화면을 보여주지 않고, 다시 시도하거나 로그아웃할 수 있게 한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ProfileErrorNotice({
  error,
  onRetry,
}: Readonly<Props>) {
  const { mutate: signOut, isPending } = useSignOut();
  const handleSignOut = useCallback(() => signOut(), [signOut]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <section role="alert" className="surface w-full max-w-sm p-7 text-center">
        <p className="eyebrow">PROFILE ERROR</p>
        <h1 className="mb-2 text-xl font-bold">
          계정 정보를 불러오지 못했습니다
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          {getErrorMessage(error)}
        </p>
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSignOut}
            disabled={isPending}
          >
            로그아웃
          </Button>
          <Button onClick={onRetry}>다시 시도</Button>
        </div>
      </section>
    </div>
  );
}
