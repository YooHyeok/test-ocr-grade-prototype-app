import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import PhoneVerifyForm from "@/components/sign-up/phone-verify-form";
import SignUpDone from "@/components/sign-up/sign-up-done";
import SignUpInfoForm, {
  type SignUpInfoValue,
} from "@/components/sign-up/sign-up-info-form";
import SignUpSteps, {
  type SignUpStep,
} from "@/components/sign-up/sign-up-steps";
import { formatStamp } from "@/lib/account";
import { PENDING_SIGNUPS } from "@/lib/mock-data";
import type { SignupRequest } from "@/type";

/**
 * 회원가입 페이지. 기본 정보 → 휴대폰 본인인증 → 승인 대기 3단계.
 * 화면 기획 단계라 계정을 만들지 않고 신청 내용만 보여준다.
 * TODO: 가입 신청 저장·본인인증 서비스 연결 (기획 확정 후 backend 계약에 추가)
 * @returns {JSX.Element}
 */
export default function SignUpPage() {
  const [step, setStep] = useState<SignUpStep>(1);
  const [info, setInfo] = useState<SignUpInfoValue | null>(null);
  const [request, setRequest] = useState<SignupRequest | null>(null);
  const takenEmails = useMemo(
    () => PENDING_SIGNUPS.map((item) => item.email),
    [],
  );

  const handleNext = useCallback((value: SignUpInfoValue) => {
    setInfo(value);
    setStep(2);
  }, []);
  const handleBack = useCallback(() => setStep(1), []);
  const handleSubmit = useCallback(
    (phone: string) => {
      if (!info?.academy) return;
      setRequest({
        id: Date.now(),
        type: info.type,
        name: info.name,
        grade: info.grade,
        academy: info.academy,
        email: info.email,
        phone,
        requestedAt: formatStamp(),
      });
      setStep(3);
    },
    [info],
  );

  return (
    <div className="bg-background flex min-h-screen items-start justify-center p-4 py-12 max-sm:py-6">
      <section className="surface w-full max-w-[460px] p-7 max-sm:p-5">
        <SignUpSteps step={step} />
        {step === 1 && (
          <SignUpInfoForm
            initial={info}
            takenEmails={takenEmails}
            onNext={handleNext}
          />
        )}
        {step === 2 && info && (
          <PhoneVerifyForm
            name={info.name}
            isStudent={info.type === "student"}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
        {step === 3 && request && <SignUpDone request={request} />}
        <p className="bg-notice text-notice-foreground mt-5 rounded-lg px-3 py-2.5 text-xs leading-normal">
          화면 기획용입니다. 실제로 계정을 만들거나 문자를 보내지 않습니다.{" "}
          {step !== 3 && (
            <Link to="/sign-in" className="font-bold underline">
              로그인으로 돌아가기
            </Link>
          )}
        </p>
      </section>
    </div>
  );
}
