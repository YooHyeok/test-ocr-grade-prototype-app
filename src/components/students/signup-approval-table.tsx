import type { SignupRequest } from "@/type";
import SignupApprovalRow from "./signup-approval-row";

type Props = {
  requests: SignupRequest[];
  onApprove: (request: SignupRequest, className: string) => void;
  onReject: (request: SignupRequest) => void;
};

const HEADERS = [
  "신청일",
  "이름",
  "학년",
  "이메일",
  "휴대폰",
  "본인인증",
  "클래스 배정",
  "처리",
];

/**
 * 가입 승인 대기 목록. 본인인증을 마친 학생의 가입 신청을 클래스 배정 후 승인하거나 거절한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SignupApprovalTable({
  requests,
  onApprove,
  onReject,
}: Readonly<Props>) {
  return (
    <div className="grid gap-3.5">
      <div className="grid gap-0.5 rounded-[10px] border border-[#cfe3d9] bg-[#f6fbf8] px-4 py-3 text-[13px] text-[#4f5d57]">
        <strong className="text-primary">
          본인인증을 마친 가입 신청입니다.
        </strong>
        <span>
          클래스를 배정하고 승인하면 학생의 가입이 완료되고, 학생이 로그인할 수
          있습니다.
        </span>
      </div>
      <div className="bg-card overflow-x-auto rounded-[10px] border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f4f6f5] text-[13px] font-bold text-[#3c4943]">
              {HEADERS.map((header) => (
                <th key={header} className="px-3 py-2.5 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <SignupApprovalRow
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="text-muted-foreground p-9 text-center text-sm">
            대기 중인 가입 신청이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
