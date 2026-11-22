import { useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import { maskPhone } from "@/lib/account";
import type { Profile } from "@/lib/backend/types";

/** 프로필에 아직 없는 내 정보 항목 (본인인증한 휴대폰, 클래스, 가입일) */
export type AccountExtra = {
  phone: string;
  classLabel: string;
  className: string;
  joined: string;
};

type Props = {
  profile: Profile;
  email: string;
  extra: AccountExtra;
};

const ROLE_LABEL = { teacher: "선생님", student: "학생" } as const;

/**
 * 계정 정보 한 줄 (이름표 + 값).
 * @param {{ term: string, children: ReactNode }} props
 * @returns {JSX.Element}
 */
function InfoRow({
  term,
  children,
}: Readonly<{ term: string; children: ReactNode }>) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 border-b border-[#eef1ee] py-3 last:border-b-0 last:pb-0 max-sm:grid-cols-1 max-sm:gap-1">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="flex flex-wrap items-center gap-2 font-semibold break-all">
        {children}
      </dd>
    </div>
  );
}

/**
 * 계정 정보 카드: 이름·역할·학원, 아이디(이메일), 본인인증한 휴대폰, 클래스, 가입일.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function AccountCard({
  profile,
  email,
  extra,
}: Readonly<Props>) {
  const roleLabel = profile.isAdmin
    ? `${ROLE_LABEL[profile.role]} · 시스템 관리자`
    : ROLE_LABEL[profile.role];
  const handlePhoneChange = useCallback(
    () =>
      toast("번호를 바꾸려면 새 번호로 본인인증을 다시 합니다. (준비 중)", {
        position: "top-center",
      }),
    [],
  );

  return (
    <article className="surface p-5.5 max-sm:px-4">
      <div className="flex items-center gap-3.5 border-b pb-4">
        <span className="grid size-13 shrink-0 place-items-center rounded-full bg-[#3d6a5a] text-lg font-bold text-white">
          {profile.name[0]}
        </span>
        <div className="min-w-0">
          <h2 className="mb-1.5 text-lg font-bold">{profile.name}</h2>
          <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-[13px]">
            <span className="bg-mint-soft text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
              {roleLabel}
            </span>
            {profile.academyName}
          </p>
        </div>
      </div>
      <dl className="text-[13px]">
        <InfoRow term="아이디 (이메일)">{email}</InfoRow>
        <InfoRow term="휴대폰">
          {maskPhone(extra.phone)}
          <span className="bg-mint-soft text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
            ✓ 본인인증 완료
          </span>
          <button
            type="button"
            onClick={handlePhoneChange}
            className="text-primary ml-auto text-xs font-bold hover:underline max-sm:ml-0"
          >
            번호 변경
          </button>
        </InfoRow>
        <InfoRow term={extra.classLabel}>{extra.className}</InfoRow>
        <InfoRow term="가입일">{extra.joined}</InfoRow>
      </dl>
    </article>
  );
}
