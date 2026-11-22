import { useCallback, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { REJECT_REASONS } from "@/lib/account";
import type { SignupRequest } from "@/type";

type Props = {
  /** 거절할 가입 신청. null이면 닫힌 상태 */
  request: SignupRequest | null;
  onConfirm: (request: SignupRequest, reason: string) => void;
  onClose: () => void;
};

const ETC = "etc";

/**
 * 가입 거절 확인 창. 사유를 고르거나 직접 입력한다. 사유는 신청한 이메일로 안내한다. (발송은 준비 중)
 * 신청마다 처음 상태로 열리도록 부모가 신청 id를 key로 넘긴다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function RejectSignupDialog({
  request,
  onConfirm,
  onClose,
}: Readonly<Props>) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [etc, setEtc] = useState("");
  const [error, setError] = useState("");

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );
  const handleReason = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => setReason(event.target.value),
    [],
  );
  const handleEtc = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setEtc(event.target.value),
    [],
  );
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!request) return;
      const text = reason === ETC ? etc.trim() : reason;
      if (!text) {
        setError("거절 사유를 입력해주세요.");
        return;
      }
      onConfirm(request, text);
    },
    [request, reason, etc, onConfirm],
  );

  return (
    <Dialog open={request !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>가입을 거절할까요?</DialogTitle>
          <DialogDescription>
            {request &&
              `${request.name} (${request.grade} · ${request.email}) 학생의 가입 신청을 거절합니다.`}
          </DialogDescription>
        </DialogHeader>
        <form
          id="reject-signup-form"
          onSubmit={handleSubmit}
          className="grid gap-3"
        >
          <label className="grid gap-1.5 text-[13px] font-bold">
            거절 사유
            <select
              value={reason}
              onChange={handleReason}
              className="field h-10 w-full text-[13px] font-normal"
            >
              {REJECT_REASONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
              <option value={ETC}>직접 입력</option>
            </select>
          </label>
          {reason === ETC && (
            <label className="grid gap-1.5 text-[13px] font-bold">
              사유 입력
              <Input
                value={etc}
                onChange={handleEtc}
                maxLength={100}
                placeholder="학생에게 안내할 사유"
                className="h-10 font-normal"
                data-testid="reject-etc"
              />
            </label>
          )}
          <small className="text-muted-foreground text-xs">
            거절 사유는 가입 신청한 이메일로 안내됩니다. (발송은 준비 중)
          </small>
          {error && (
            <p role="alert" className="text-destructive text-xs">
              {error}
            </p>
          )}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="reject-signup-form" variant="destructive">
            거절
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
