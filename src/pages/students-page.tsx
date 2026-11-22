import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import RejectSignupDialog from "@/components/students/reject-signup-dialog";
import SignupApprovalTable from "@/components/students/signup-approval-table";
import StudentList from "@/components/students/student-list";
import { formatStamp } from "@/lib/account";
import { PENDING_SIGNUPS, STUDENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { SignupRequest, Student } from "@/type";

type Tab = "list" | "approvals";

/**
 * 학생 관리 페이지. 학생 목록과 가입 승인(본인인증을 마친 가입 신청) 탭.
 * 화면 기획 단계라 승인·거절은 화면 안에서만 반영한다.
 * TODO: 가입 신청 조회·승인·거절 backend 계약 연결
 * @returns {JSX.Element}
 */
export default function StudentsPage() {
  const [tab, setTab] = useState<Tab>("list");
  const [pending, setPending] = useState<SignupRequest[]>(PENDING_SIGNUPS);
  const [joined, setJoined] = useState<Student[]>([]);
  const [rejecting, setRejecting] = useState<SignupRequest | null>(null);

  const students = useMemo(() => [...joined, ...STUDENTS], [joined]);
  const tabs = useMemo(
    () => [
      { value: "list" as const, label: "학생 목록", count: null },
      {
        value: "approvals" as const,
        label: "가입 승인",
        count: pending.length,
      },
    ],
    [pending.length],
  );

  const handleTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setTab(event.currentTarget.value as Tab),
    [],
  );
  const handleApprove = useCallback(
    (request: SignupRequest, className: string) => {
      if (!className) {
        toast.error("클래스를 먼저 배정해주세요.", { position: "top-center" });
        return;
      }
      setPending((list) => list.filter((item) => item.id !== request.id));
      setJoined((list) => [
        {
          name: request.name,
          className,
          needsReview: false,
          isNew: true,
          note: `${formatStamp()} 승인`,
        },
        ...list,
      ]);
      toast.success(
        `${request.name} 학생의 가입을 승인했습니다. (${className})`,
        {
          position: "top-center",
        },
      );
    },
    [],
  );
  const handleRejectConfirm = useCallback(
    (request: SignupRequest, reason: string) => {
      setPending((list) => list.filter((item) => item.id !== request.id));
      setRejecting(null);
      toast.success(`${request.name} 학생의 가입을 거절했습니다. (${reason})`, {
        position: "top-center",
      });
    },
    [],
  );
  const handleRejectClose = useCallback(() => setRejecting(null), []);

  return (
    <>
      <div className="mt-4 flex items-end justify-between gap-4 border-b">
        <div role="tablist" aria-label="학생 관리 탭" className="flex gap-7">
          {tabs.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              value={item.value}
              aria-selected={tab === item.value}
              onClick={handleTab}
              className={cn(
                "-mb-px flex items-center gap-1 border-b-2 border-transparent px-0.5 pt-1 pb-3 text-[15px] font-bold text-[#56635e]",
                tab === item.value && "border-primary text-primary",
              )}
            >
              {item.label}
              {item.count !== null && item.count > 0 && (
                <span
                  className="bg-coral grid h-[19px] min-w-[19px] place-items-center rounded-full px-1.5 text-[11px] text-white"
                  data-testid="approval-count"
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button className="mb-2">
          <Plus />
          학생 등록
        </Button>
      </div>

      {tab === "list" ? (
        <StudentList students={students} />
      ) : (
        <div className="mt-5.5">
          <SignupApprovalTable
            requests={pending}
            onApprove={handleApprove}
            onReject={setRejecting}
          />
        </div>
      )}
      <RejectSignupDialog
        key={rejecting?.id ?? "closed"}
        request={rejecting}
        onConfirm={handleRejectConfirm}
        onClose={handleRejectClose}
      />
    </>
  );
}
