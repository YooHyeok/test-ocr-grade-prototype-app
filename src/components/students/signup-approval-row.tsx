import { memo, useCallback, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { CLASS_OPTIONS, maskPhone, suggestClass } from "@/lib/account";
import type { SignupRequest } from "@/type";

type Props = {
  request: SignupRequest;
  onApprove: (request: SignupRequest, className: string) => void;
  onReject: (request: SignupRequest) => void;
};

/**
 * 가입 신청 한 줄. 클래스는 학년에 맞는 것을 미리 골라 두고, 선생님이 바꿀 수 있다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
function SignupApprovalRow({ request, onApprove, onReject }: Readonly<Props>) {
  const [className, setClassName] = useState(() => suggestClass(request.grade));

  const handleClass = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => setClassName(event.target.value),
    [],
  );
  const handleApprove = useCallback(
    () => onApprove(request, className),
    [onApprove, request, className],
  );
  const handleReject = useCallback(
    () => onReject(request),
    [onReject, request],
  );

  return (
    <tr className="border-t text-center text-[13px] text-[#3c4943]">
      <td className="px-3 py-3 whitespace-nowrap">{request.requestedAt}</td>
      <td className="px-3 py-3 font-bold">{request.name}</td>
      <td className="px-3 py-3">{request.grade}</td>
      <td className="px-3 py-3">{request.email}</td>
      <td className="px-3 py-3 whitespace-nowrap">
        {maskPhone(request.phone)}
      </td>
      <td className="px-3 py-3">
        <span className="bg-mint-soft text-primary rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap">
          ✓ 완료
        </span>
      </td>
      <td className="px-3 py-3">
        <select
          value={className}
          onChange={handleClass}
          aria-label={`${request.name} 클래스 배정`}
          className="field h-[34px] min-w-[140px]"
        >
          <option value="">클래스 선택</option>
          {CLASS_OPTIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className="inline-flex gap-1.5">
          <Button size="sm" onClick={handleApprove}>
            승인
          </Button>
          <Button size="sm" variant="outline" onClick={handleReject}>
            거절
          </Button>
        </span>
      </td>
    </tr>
  );
}

export default memo(SignupApprovalRow);
