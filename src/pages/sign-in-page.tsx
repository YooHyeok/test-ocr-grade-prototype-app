import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { getErrorMessage } from "@/lib/error";

/**
 * 로그인 페이지. 계정은 학원에서 발급한 이메일·비밀번호를 사용한다.
 * TODO: 비밀번호 찾기, 학생 계정 발급 흐름(기획 확정 후)
 * @returns {JSX.Element}
 */
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signIn, isPending } = useSignInWithPassword({
    onError: (error) => {
      toast.error(getErrorMessage(error), { position: "top-center" });
      setPassword("");
    },
  });

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
    [],
  );
  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    [],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email.trim() || !password.trim()) return;
      signIn({ email: email.trim(), password });
    },
    [email, password, signIn],
  );

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <section className="surface w-full max-w-sm p-7">
        <p className="eyebrow">SIGN IN</p>
        <h1 className="mb-1 text-2xl font-bold">쪽지시험 로그인</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          학원에서 발급받은 계정으로 로그인하세요.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-2.5">
          <Input
            type="email"
            autoComplete="email"
            placeholder="example@academy.com"
            value={email}
            onChange={handleEmailChange}
            disabled={isPending}
            className="h-11"
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={handlePasswordChange}
            disabled={isPending}
            className="h-11"
          />
          <Button type="submit" disabled={isPending} className="mt-2 h-11">
            {isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </section>
    </div>
  );
}
