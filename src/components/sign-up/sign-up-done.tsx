import { useMemo } from "react";
import { Link } from "react-router";
import { Check, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskPhone } from "@/lib/account";
import { cn } from "@/lib/utils";
import type { SignupRequest } from "@/type";

type Props = {
  request: SignupRequest;
};

/**
 * 회원가입 3단계: 가입 신청 접수 안내. 학생은 선생님, 선생님은 학원 관리자가 승인해야 가입이 끝난다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SignUpDone({ request }: Readonly<Props>) {
  const teacher = request.type === "teacher";
  const approver = teacher ? "학원 관리자" : "선생님";
  const approverSubject = teacher ? "학원 관리자가" : "선생님이";
  const summary = useMemo(
    () => [
      ["이름", request.name],
      ["학원", request.academy],
      ["가입 유형", teacher ? "선생님" : `학생 · ${request.grade}`],
      ["이메일", request.email],
      ["휴대폰", `${maskPhone(request.phone)} (인증 완료)`],
    ],
    [request, teacher],
  );
  const progress = useMemo(
    () => [
      { label: "정보 입력", done: true },
      { label: "본인인증", done: true },
      { label: `${approver} 승인 대기`, done: false },
    ],
    [approver],
  );

  return (
    <div className="grid justify-items-center gap-3.5 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-[#fff3d6]">
        <Hourglass className="size-7 text-[#b07d00]" />
      </span>
      <h1 className="text-2xl font-bold">가입 신청이 접수되었습니다</h1>
      <p className="text-muted-foreground text-[13px] leading-relaxed">
        {request.academy} {approverSubject} 승인하면 가입이 완료됩니다. 승인되면
        이메일로 알려드려요.
      </p>

      <dl className="bg-card w-full rounded-[10px] border px-4 py-1 text-left">
        {summary.map(([term, detail]) => (
          <div
            key={term}
            className="grid grid-cols-[80px_1fr] gap-2.5 border-t border-[#eef1ee] py-2.5 text-[13px] first:border-t-0"
          >
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="font-semibold break-all">{detail}</dd>
          </div>
        ))}
      </dl>

      <ol aria-label="가입 진행 상태" className="grid w-full grid-cols-3">
        {progress.map((item, index) => (
          <li
            key={item.label}
            className={cn(
              "relative grid justify-items-center gap-1.5 text-xs font-bold",
              item.done ? "text-muted-foreground" : "text-[#b07d00]",
            )}
          >
            {index > 0 && (
              <span className="absolute top-3 right-1/2 h-0.5 w-full bg-[#cfe3d9]" />
            )}
            <span
              className={cn(
                "relative z-10 grid size-6.5 place-items-center rounded-full text-white",
                item.done ? "bg-[#6fb293]" : "bg-[#f0b429]",
              )}
            >
              {item.done ? <Check className="size-3.5" /> : "…"}
            </span>
            {item.label}
          </li>
        ))}
      </ol>

      <Button asChild className="h-11.5 w-full">
        <Link to="/sign-in">로그인 화면으로</Link>
      </Button>
    </div>
  );
}
