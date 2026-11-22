import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPhone, isPhone, VERIFY_SECONDS } from "@/lib/account";
import { cn } from "@/lib/utils";

type Props = {
  /** 가입하는 사람 이름 (인증 완료 안내) */
  name: string;
  /** 학생이면 만 14세 미만 보호자 인증 안내를 보여준다. */
  isStudent: boolean;
  onBack: () => void;
  /** 본인인증을 마친 번호로 가입 신청 */
  onSubmit: (phone: string) => void;
};

const LABEL = "grid gap-1.5 text-[13px] font-bold text-[#3c4943]";

/**
 * 남은 초를 "MM:SS"로 만든다.
 * @param {number} seconds - 남은 초
 * @returns {string}
 */
function formatTimer(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * 회원가입 2단계: 휴대폰 본인인증. 인증번호 받기 → 3분 안에 6자리 입력 → 확인.
 * 화면 기획용이라 문자를 보내지 않고, 아무 6자리 숫자나 통과한다.
 * TODO: PASS 등 휴대폰 본인확인 서비스 창 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PhoneVerifyForm({
  name,
  isStudent,
  onBack,
  onSubmit,
}: Readonly<Props>) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  // 인증번호를 보낸 뒤 인증 전까지 1초마다 남은 시간을 줄인다.
  useEffect(() => {
    if (!sent || verified) return undefined;
    const timer = window.setInterval(
      () => setSecondsLeft((left) => Math.max(0, left - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [sent, verified]);

  const handlePhone = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
    setVerified(false);
  }, []);
  const handleCode = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setCode(event.target.value.replace(/\D/g, "").slice(0, 6)),
    [],
  );
  const handleSend = useCallback(() => {
    if (!isPhone(phone)) {
      setError("휴대폰 번호를 확인해주세요.");
      return;
    }
    setError("");
    setPhone(formatPhone(phone));
    setSent(true);
    setVerified(false);
    setCode("");
    setSecondsLeft(VERIFY_SECONDS);
    toast.success("인증번호를 보냈습니다. (데모)", { position: "top-center" });
  }, [phone]);
  const handleConfirm = useCallback(() => {
    if (secondsLeft === 0) {
      setError("입력 시간이 지났습니다. 인증번호를 다시 받아주세요.");
      return;
    }
    if (code.length !== 6) {
      setError("인증번호 6자리를 입력해주세요.");
      return;
    }
    setError("");
    setVerified(true);
  }, [code, secondsLeft]);
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (verified) onSubmit(phone);
    },
    [verified, phone, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
      <h1 className="text-2xl font-bold">본인인증</h1>
      <p className="text-muted-foreground -mt-1 text-[13px] leading-relaxed">
        가입한 사람이 본인인지 휴대폰으로 확인합니다. 인증한 번호는 내 정보에서
        알림 받을 번호로도 쓸 수 있어요.
      </p>

      <label className={LABEL}>
        휴대폰 번호
        <span className="flex gap-2">
          <Input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handlePhone}
            autoComplete="tel"
            placeholder="010-0000-0000"
            className="h-11 font-normal"
            data-testid="verify-phone"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSend}
            className="h-11"
          >
            {sent ? "다시 받기" : "인증번호 받기"}
          </Button>
        </span>
      </label>

      {sent && !verified && (
        <label className={LABEL}>
          인증번호
          <span className="flex gap-2">
            <span className="relative flex-1">
              <Input
                inputMode="numeric"
                value={code}
                onChange={handleCode}
                autoComplete="one-time-code"
                placeholder="6자리 숫자"
                className="h-11 pr-16 font-normal tracking-[3px]"
                data-testid="verify-code"
              />
              <em
                className={cn(
                  "absolute top-1/2 right-3 -translate-y-1/2 text-[13px] font-bold not-italic",
                  secondsLeft > 0 ? "text-[#d0533e]" : "text-[#9aa39e]",
                )}
                data-testid="verify-timer"
              >
                {formatTimer(secondsLeft)}
              </em>
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirm}
              className="h-11"
            >
              확인
            </Button>
          </span>
          <small className="text-xs font-normal text-[#7b8984]">
            데모: 아무 6자리 숫자나 입력하면 통과합니다.
          </small>
        </label>
      )}

      {verified && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-[10px] border border-[#cfe3d9] bg-[#f3faf6] p-3.5"
        >
          <CircleCheck className="text-primary size-7 shrink-0" />
          <span className="grid gap-0.5">
            <strong className="text-primary text-sm">
              본인인증이 완료되었습니다
            </strong>
            <small className="text-muted-foreground text-xs">
              {name} · {phone}
            </small>
          </span>
        </div>
      )}

      {isStudent && (
        <small className="text-xs text-[#7b8984]">
          만 14세 미만 학생은 보호자 휴대폰으로 인증하고 보호자 동의를 받습니다.
        </small>
      )}
      <small className="text-xs text-[#7b8984]">
        실제 서비스에서는 PASS 등 휴대폰 본인확인 서비스 창이 열립니다.
      </small>

      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="h-11.5"
        >
          이전
        </Button>
        <Button type="submit" disabled={!verified} className="h-11.5">
          가입 신청
        </Button>
      </div>
    </form>
  );
}
