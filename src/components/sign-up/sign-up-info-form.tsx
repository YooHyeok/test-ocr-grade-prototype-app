import {
  useCallback,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  findAcademy,
  GRADES,
  validateSignupInfo,
  type SignupInfo,
} from "@/lib/account";
import { cn } from "@/lib/utils";
import type { SignupType } from "@/type";
import TermsAgreement, { type TermsAgreed } from "./terms-agreement";

/** 1단계 입력 (다음 단계로 넘길 때 학원 코드도 함께 보관해 이전으로 돌아오면 다시 채운다) */
export type SignUpInfoValue = SignupInfo & { academyCode: string };

type Props = {
  /** 이전 단계에서 돌아왔을 때 채울 값 */
  initial: SignUpInfoValue | null;
  /** 이미 가입 신청한 이메일 (중복 신청 막기) */
  takenEmails: string[];
  onNext: (info: SignUpInfoValue) => void;
};

const LABEL = "grid gap-1.5 text-[13px] font-bold text-[#3c4943]";
const TYPE_OPTIONS: {
  value: SignupType;
  title: string;
  description: string;
}[] = [
  {
    value: "student",
    title: "학생",
    description: "시험지를 올리고 채점 결과를 받아요",
  },
  {
    value: "teacher",
    title: "선생님",
    description: "시험지를 만들고 채점을 관리해요",
  },
];

/**
 * 회원가입 1단계: 가입 유형, 학원 코드 확인, 이름·학년, 이메일(아이디), 비밀번호, 필수 약관 동의.
 * 주소 같은 추가 정보는 받지 않는다. 다음을 누르면 위에서부터 첫 번째 문제를 알려준다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SignUpInfoForm({
  initial,
  takenEmails,
  onNext,
}: Readonly<Props>) {
  const [type, setType] = useState<SignupType>(initial?.type ?? "student");
  const [academyCode, setAcademyCode] = useState(initial?.academyCode ?? "");
  const [academy, setAcademy] = useState<string | null>(
    initial?.academy ?? null,
  );
  const [codeChecked, setCodeChecked] = useState(Boolean(initial?.academy));
  const [name, setName] = useState(initial?.name ?? "");
  const [grade, setGrade] = useState(initial?.grade ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [passwordConfirm, setPasswordConfirm] = useState(
    initial?.passwordConfirm ?? "",
  );
  const [agreed, setAgreed] = useState<TermsAgreed>({
    service: initial?.agreed ?? false,
    privacy: initial?.agreed ?? false,
  });
  const [error, setError] = useState("");

  const handleType = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setType(event.target.value as SignupType),
    [],
  );
  const handleCodeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAcademyCode(event.target.value);
      setAcademy(null);
      setCodeChecked(false);
    },
    [],
  );
  const checkCode = useCallback(() => {
    setAcademy(findAcademy(academyCode));
    setCodeChecked(Boolean(academyCode.trim()));
  }, [academyCode]);
  const handleCodeKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      checkCode();
    },
    [checkCode],
  );
  const handleName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [],
  );
  const handleGrade = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => setGrade(event.target.value),
    [],
  );
  const handleEmail = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value),
    [],
  );
  const handlePassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    [],
  );
  const handlePasswordConfirm = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setPasswordConfirm(event.target.value),
    [],
  );

  // 약관을 고치면 지난번 검사 문구는 지운다. (다음을 누를 때 다시 검사)
  const handleAgreed = useCallback((next: TermsAgreed) => {
    setAgreed(next);
    setError("");
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const info: SignUpInfoValue = {
        type,
        academyCode,
        academy,
        name: name.trim(),
        grade: type === "student" ? grade : "",
        email: email.trim().toLowerCase(),
        password,
        passwordConfirm,
        agreed: agreed.service && agreed.privacy,
      };
      const message = validateSignupInfo(info, takenEmails);
      setError(message ?? "");
      if (!message) onNext(info);
    },
    [
      type,
      academyCode,
      academy,
      name,
      grade,
      email,
      password,
      passwordConfirm,
      agreed,
      takenEmails,
      onNext,
    ],
  );

  let academyHint = "학원에서 받은 코드를 입력하세요.";
  if (academy) academyHint = `✓ ${academy}`;
  else if (codeChecked)
    academyHint = "학원 코드를 찾을 수 없습니다. (데모: RAON, BRIDGE)";

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
      <h1 className="mb-1 text-2xl font-bold">회원가입</h1>

      <div
        role="radiogroup"
        aria-label="가입 유형"
        className="grid grid-cols-2 gap-2.5"
      >
        {TYPE_OPTIONS.map((option) => (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type="radio"
              name="signup-type"
              value={option.value}
              checked={type === option.value}
              onChange={handleType}
              className="peer absolute opacity-0"
            />
            <span className="bg-card peer-checked:border-primary peer-focus-visible:outline-primary grid h-full gap-1 rounded-[10px] border-[1.5px] border-[#d9dfdc] px-3.5 py-3 peer-checked:bg-[#f3faf6] peer-checked:shadow-[0_0_0_3px_rgba(29,118,88,.1)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
              <strong className="text-sm">{option.title}</strong>
              <small className="text-muted-foreground text-xs leading-snug">
                {option.description}
              </small>
            </span>
          </label>
        ))}
      </div>

      <label className={LABEL}>
        학원 코드
        <span className="flex gap-2">
          <Input
            value={academyCode}
            onChange={handleCodeChange}
            onKeyDown={handleCodeKeyDown}
            placeholder="예: RAON"
            autoComplete="off"
            className="h-11 font-mono font-normal"
            data-testid="academy-code"
          />
          <Button
            type="button"
            variant="outline"
            onClick={checkCode}
            className="h-11"
          >
            확인
          </Button>
        </span>
        <small
          className={cn(
            "text-xs font-normal text-[#7b8984]",
            academy && "text-primary font-bold",
            !academy && codeChecked && "text-destructive",
          )}
          data-testid="academy-hint"
        >
          {academyHint}
        </small>
      </label>

      <div
        className={cn(
          "grid gap-3",
          type === "student" && "grid-cols-2 max-sm:grid-cols-1",
        )}
      >
        <label className={LABEL}>
          이름
          <Input
            value={name}
            onChange={handleName}
            autoComplete="name"
            placeholder="실명"
            className="h-11 font-normal"
            data-testid="signup-name"
          />
        </label>
        {type === "student" && (
          <label className={LABEL}>
            학년
            <select
              value={grade}
              onChange={handleGrade}
              className="field h-11 w-full text-sm font-normal"
              data-testid="signup-grade"
            >
              <option value="">학년 선택</option>
              {GRADES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className={LABEL}>
        이메일 (아이디)
        <Input
          type="email"
          value={email}
          onChange={handleEmail}
          autoComplete="email"
          placeholder="example@email.com"
          className="h-11 font-normal"
          data-testid="signup-email"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <label className={LABEL}>
          비밀번호
          <Input
            type="password"
            value={password}
            onChange={handlePassword}
            autoComplete="new-password"
            placeholder="8자 이상, 영문·숫자 포함"
            className="h-11 font-normal"
            data-testid="signup-password"
          />
        </label>
        <label className={LABEL}>
          비밀번호 확인
          <Input
            type="password"
            value={passwordConfirm}
            onChange={handlePasswordConfirm}
            autoComplete="new-password"
            className="h-11 font-normal"
            data-testid="signup-password-confirm"
          />
        </label>
      </div>

      <TermsAgreement agreed={agreed} onChange={handleAgreed} />

      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
      <Button type="submit" className="h-11.5 w-full">
        다음 · 본인인증
      </Button>
      <p className="text-muted-foreground mt-1 text-center text-[13px]">
        이미 계정이 있나요?{" "}
        <Link to="/sign-in" className="text-primary font-bold hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
