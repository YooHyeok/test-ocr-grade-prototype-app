import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { getErrorMessage } from "@/lib/error";
import { appConfig } from "@/lib/app-config";
import { DEMO_ACCOUNTS } from "@/lib/backend/mock";

/**
 * 로그인 페이지. 계정은 학원에서 발급한 이메일·비밀번호를 사용한다.
 * 계정이 없으면 회원가입(학원 코드·본인인증·선생님 승인)으로 이동한다.
 * TODO: 비밀번호 찾기
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
          가입 승인을 받은 계정으로 로그인하세요.
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

        <p className="text-muted-foreground mt-4.5 text-center text-[13px]">
          아직 계정이 없나요?{" "}
          <Link
            to="/sign-up"
            className="text-primary font-bold hover:underline"
          >
            회원가입
          </Link>
        </p>

        {appConfig.backend === "mock" && (
          <div className="bg-muted text-muted-foreground mt-5 rounded-lg p-3 text-xs">
            <strong className="text-foreground mb-1 block">
              데모 모드 (mock 백엔드)
            </strong>
            {DEMO_ACCOUNTS.map((account) => (
              <p key={account.email}>
                {account.profile.role === "teacher" ? "선생님" : "학생"}:{" "}
                {account.email} / {account.password}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
