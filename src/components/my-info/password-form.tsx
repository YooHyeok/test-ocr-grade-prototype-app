import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isStrongPassword } from "@/lib/account";

const LABEL = "grid gap-1.5 text-[13px] font-bold text-[#3c4943]";

/**
 * 비밀번호 변경 폼. 화면 기획 단계라 검사만 하고 실제로 바꾸지 않는다.
 * TODO: backend 계약(비밀번호 변경) 연결
 * @returns {JSX.Element}
 */
export default function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleCurrent = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setCurrent(event.target.value),
    [],
  );
  const handleNext = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setNext(event.target.value),
    [],
  );
  const handleConfirm = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setConfirm(event.target.value),
    [],
  );
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      let message = "";
      if (!current) message = "현재 비밀번호를 입력해주세요.";
      else if (!isStrongPassword(next))
        message = "새 비밀번호는 8자 이상, 영문과 숫자를 섞어주세요.";
      else if (next !== confirm)
        message = "새 비밀번호 확인이 일치하지 않습니다.";
      setError(message);
      if (message) return;
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("비밀번호를 변경했습니다. (데모)", {
        position: "top-center",
      });
    },
    [current, next, confirm],
  );

  return (
    <article className="surface p-5.5 max-sm:px-4">
      <h2 className="mb-3.5 text-base font-bold">비밀번호 변경</h2>
      <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
        <label className={LABEL}>
          현재 비밀번호
          <Input
            type="password"
            value={current}
            onChange={handleCurrent}
            autoComplete="current-password"
            className="h-10.5 font-normal"
          />
        </label>
        <label className={LABEL}>
          새 비밀번호
          <Input
            type="password"
            value={next}
            onChange={handleNext}
            autoComplete="new-password"
            placeholder="8자 이상, 영문·숫자 포함"
            className="h-10.5 font-normal"
          />
        </label>
        <label className={LABEL}>
          새 비밀번호 확인
          <Input
            type="password"
            value={confirm}
            onChange={handleConfirm}
            autoComplete="new-password"
            className="h-10.5 font-normal"
          />
        </label>
        {error && (
          <p role="alert" className="text-destructive text-xs">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" variant="secondary">
            비밀번호 변경
          </Button>
        </div>
      </form>
    </article>
  );
}
