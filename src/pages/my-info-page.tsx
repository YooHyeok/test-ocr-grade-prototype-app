import AccountCard from "@/components/my-info/account-card";
import PasswordForm from "@/components/my-info/password-form";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { MY_ACCOUNT_EXTRA } from "@/lib/mock-data";
import { useSession } from "@/store/session";

/**
 * 내 정보 페이지 (선생님·학생 공통). 계정 정보와 비밀번호 변경.
 * 휴대폰·클래스·가입일은 프로필에 아직 없어 예시 값을 보여준다.
 * TODO: 프로필 확장(휴대폰·클래스·가입일) 후 backend에서 조회
 * @returns {JSX.Element}
 */
export default function MyInfoPage() {
  const session = useSession();
  const profile = useCurrentProfile();
  if (!profile) return null;

  const email = session?.user.email ?? "";
  const extra = MY_ACCOUNT_EXTRA[profile.role];

  return (
    <div className="mt-4.5 grid max-w-[640px] items-start gap-4">
      <AccountCard profile={profile} email={email} extra={extra} />
      <PasswordForm />
    </div>
  );
}
