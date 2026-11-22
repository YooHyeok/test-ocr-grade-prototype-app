import { memo, useCallback, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/lib/account";
import { cn } from "@/lib/utils";
import type { NotifyMethod, NotifyPhone, NotifyPrefs } from "@/type";
import NotifyIcon from "./notify-icon";

type Props = {
  method: NotifyMethod;
  name: string;
  prefs: NotifyPrefs;
  /** 계정 이메일 (안내 문구) */
  accountEmail: string;
  /** 본인인증한 번호 */
  verifiedPhone: string;
  onChange: (patch: Partial<NotifyPrefs>) => void;
};

const NOTE = "text-xs leading-normal text-[#7b8984]";

/**
 * 고른 알림 방법 하나에 필요한 입력.
 * - 이메일: 받을 이메일
 * - 앱 푸시: 이 기기에서 알림 허용
 * - 문자·카카오톡: 본인인증한 번호 / 다른 번호
 * @param {Props} props
 * @returns {JSX.Element}
 */
function NotifyMethodDetail({
  method,
  name,
  prefs,
  accountEmail,
  verifiedPhone,
  onChange,
}: Readonly<Props>) {
  const handleEmail = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange({ email: event.target.value.trim() }),
    [onChange],
  );
  const togglePush = useCallback(
    () => onChange({ pushAllowed: !prefs.pushAllowed }),
    [onChange, prefs.pushAllowed],
  );
  const phoneMethod = method === "sms" || method === "kakao" ? method : null;
  const handlePhoneMode = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!phoneMethod) return;
      const next: NotifyPhone = {
        ...prefs[phoneMethod],
        useVerified: event.target.value === "verified",
      };
      onChange({ [phoneMethod]: next });
    },
    [onChange, phoneMethod, prefs],
  );
  const handlePhone = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!phoneMethod) return;
      onChange({
        [phoneMethod]: {
          ...prefs[phoneMethod],
          phone: event.target.value.trim(),
        },
      });
    },
    [onChange, phoneMethod, prefs],
  );

  let body;
  if (method === "email") {
    body = (
      <>
        <label className="grid gap-1.75 text-xs font-bold text-[#3c4943]">
          받을 이메일
          <Input
            type="email"
            value={prefs.email}
            onChange={handleEmail}
            placeholder="example@email.com"
            className="h-9.5 bg-white font-normal"
            data-testid="notify-email-input"
          />
        </label>
        <small className={NOTE}>
          계정 이메일({accountEmail})과 다른 주소로도 받을 수 있어요.
        </small>
      </>
    );
  } else if (method === "push") {
    body = (
      <>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2.5 rounded-[9px] border border-dashed border-[#d0d8d4] bg-white px-3.25 py-2.75",
            prefs.pushAllowed && "border-solid border-[#cfe3d9] bg-[#f3faf6]",
          )}
        >
          <span className="grid gap-0.5">
            <strong
              className={cn("text-[13px]", prefs.pushAllowed && "text-primary")}
            >
              {prefs.pushAllowed
                ? "● 이 기기에서 받는 중"
                : "이 기기는 아직 알림이 꺼져 있어요"}
            </strong>
            <small className="text-[11px] text-[#7b8984]">
              {prefs.pushAllowed
                ? "이 브라우저"
                : "버튼을 누르면 브라우저가 알림 허용을 물어봐요."}
            </small>
          </span>
          {prefs.pushAllowed ? (
            <button
              type="button"
              onClick={togglePush}
              className="text-primary text-[13px] font-bold hover:underline"
            >
              끄기
            </button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={togglePush}
              data-testid="push-allow"
            >
              이 기기에서 알림 허용
            </Button>
          )}
        </div>
        <small className={NOTE}>
          아이폰은 Safari에서 ‘홈 화면에 추가’한 뒤 알림을 허용할 수 있어요.
        </small>
      </>
    );
  } else if (phoneMethod) {
    const target = prefs[phoneMethod];
    body = (
      <>
        <div className="grid gap-1.75 text-xs font-bold text-[#3c4943]">
          받을 휴대폰 번호
          <div className="flex flex-wrap gap-x-4.5 gap-y-2 text-[13px] font-normal text-[#4f5d57]">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name={`${phoneMethod}-phone`}
                value="verified"
                checked={target.useVerified}
                onChange={handlePhoneMode}
                className="accent-primary"
              />
              본인인증한 번호{" "}
              <b className="text-foreground">{maskPhone(verifiedPhone)}</b>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name={`${phoneMethod}-phone`}
                value="other"
                checked={!target.useVerified}
                onChange={handlePhoneMode}
                className="accent-primary"
                data-testid={`${phoneMethod}-phone-other`}
              />
              다른 번호
            </label>
          </div>
          {!target.useVerified && (
            <Input
              type="tel"
              inputMode="numeric"
              value={target.phone}
              onChange={handlePhone}
              placeholder="010-0000-0000"
              aria-label={`${name} 받을 휴대폰 번호`}
              className="h-9.5 bg-white font-normal"
              data-testid={`${phoneMethod}-phone-input`}
            />
          )}
        </div>
        <small className={NOTE}>
          {phoneMethod === "sms"
            ? "학원에서 문자 발송을 연결하면 받을 수 있어요."
            : "학원에서 카카오 알림톡을 연결하면 받을 수 있어요."}{" "}
          (유료 서비스 · 준비 중)
        </small>
      </>
    );
  }

  return (
    <section
      className="grid gap-2.25 rounded-[11px] border bg-[#fafbfa] px-4 py-3.5"
      data-testid={`notify-detail-${method}`}
    >
      <h3 className="flex items-center gap-2 text-[13px] font-bold">
        <NotifyIcon method={method} small />
        {name}
      </h3>
      {body}
    </section>
  );
}

export default memo(NotifyMethodDetail);
