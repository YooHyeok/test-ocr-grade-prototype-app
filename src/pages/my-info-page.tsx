import AccountCard from "@/components/my-info/account-card";
import NotifySettings from "@/components/my-info/notify-settings";
import PasswordForm from "@/components/my-info/password-form";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { MY_ACCOUNT_EXTRA } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useSession } from "@/store/session";

/**
 * 내 정보 페이지 (선생님·학생 공통). 계정 정보와 비밀번호 변경, 학생은 알림 받는 방법까지.
 * 휴대폰·클래스·가입일은 프로필에 아직 없어 예시 값을 보여준다.
 * TODO: 프로필 확장(휴대폰·클래스·가입일) 후 backend에서 조회
 * @returns {JSX.Element}
 */
export default function MyInfoPage() {
  const session = useSession();
  const profile = useCurrentProfile();
  if (!profile) return null;

  const student = profile.role === "student";
  const email = session?.user.email ?? "";
  const extra = MY_ACCOUNT_EXTRA[profile.role];

  return (
    <div
      className={cn(
        "mt-4.5 grid items-start gap-4",
        student
          ? "grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] max-[68.75rem]:grid-cols-1"
          : "max-w-[640px] grid-cols-1",
      )}
    >
      {/* 한 줄로 쌓이면 학생은 기본 정보 → 알림 받는 방법 → 비밀번호 순서 */}
      <div className={cn("grid gap-4", student && "max-[68.75rem]:contents")}>
        <AccountCard profile={profile} email={email} extra={extra} />
        <div className={cn(student && "max-[68.75rem]:order-2")}>
          <PasswordForm />
        </div>
      </div>
      {student && (
        <NotifySettings
          userId={profile.id}
          accountEmail={email}
          verifiedPhone={extra.phone}
        />
      )}
    </div>
  );
}
