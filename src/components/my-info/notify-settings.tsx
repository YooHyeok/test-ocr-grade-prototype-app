import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  formatPhone,
  NOTIFY_METHODS,
  validateNotifyPrefs,
} from "@/lib/account";
import { cn } from "@/lib/utils";
import { useNotifyPrefs } from "@/hooks/use-notify-prefs";
import type { NotifyPrefs } from "@/type";
import NotifyMethodDetail from "./notify-method-detail";
import NotifyMethodOption from "./notify-method-option";

type Props = {
  userId: string;
  accountEmail: string;
  /** 본인인증한 번호 */
  verifiedPhone: string;
};

/**
 * 학생의 알림 받는 방법. 여러 개를 고를 수 있고, 고른 방법마다 필요한 정보를 입력한다.
 * 고친 내용은 저장해야 반영되며, 되돌리기로 저장된 설정으로 돌아간다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function NotifySettings({
  userId,
  accountEmail,
  verifiedPhone,
}: Readonly<Props>) {
  const [saved, save] = useNotifyPrefs(userId, accountEmail);
  const [draft, setDraft] = useState<NotifyPrefs>(saved);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );
  const selected = useMemo(
    () => NOTIFY_METHODS.filter((method) => draft.methods.includes(method.id)),
    [draft.methods],
  );

  const handleToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setDraft((prev) => {
      const methods = new Set(prev.methods);
      if (checked) methods.add(value as NotifyPrefs["methods"][number]);
      else methods.delete(value as NotifyPrefs["methods"][number]);
      // 선택 순서와 관계없이 화면 순서대로 둔다.
      return {
        ...prev,
        methods: NOTIFY_METHODS.map((method) => method.id).filter((id) =>
          methods.has(id),
        ),
      };
    });
  }, []);
  const handleChange = useCallback((patch: Partial<NotifyPrefs>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.pushAllowed)
      toast.success("이 기기에서 알림을 허용했습니다. (데모)", {
        position: "top-center",
      });
  }, []);
  const handleReset = useCallback(() => setDraft(saved), [saved]);
  const handleSave = useCallback(() => {
    const message = validateNotifyPrefs(draft);
    if (message) {
      toast.error(message, { position: "top-center" });
      return;
    }
    const next: NotifyPrefs = {
      ...draft,
      sms: { ...draft.sms, phone: formatPhone(draft.sms.phone) },
      kakao: { ...draft.kakao, phone: formatPhone(draft.kakao.phone) },
    };
    save(next);
    setDraft(next);
    toast.success("알림 받는 방법을 저장했습니다.", { position: "top-center" });
  }, [draft, save]);

  let hint = "";
  if (draft.methods.length === 0)
    hint =
      "고른 방법이 없으면 채점 결과와 학원 공지를 알림으로 받을 수 없어요.";
  else if (dirty) hint = "바꾼 내용을 저장해주세요.";

  return (
    <article
      className="surface p-5.5 max-sm:px-4"
      aria-labelledby="notify-title"
    >
      <h2 id="notify-title" className="text-base font-bold">
        알림 받는 방법
      </h2>
      <p className="text-muted-foreground mt-1 mb-4 text-[13px]">
        채점 결과와 학원 공지를 받을 방법을 고르세요. 여러 개를 고를 수 있어요.
      </p>

      <div className="grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
        {NOTIFY_METHODS.map((method) => (
          <NotifyMethodOption
            key={method.id}
            id={method.id}
            name={method.name}
            description={method.description}
            paid={method.paid}
            checked={draft.methods.includes(method.id)}
            onChange={handleToggle}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-2.5">
        {selected.length === 0 ? (
          <p className="text-muted-foreground rounded-[11px] border border-dashed p-5 text-center text-[13px]">
            위에서 알림 받을 방법을 골라주세요.
          </p>
        ) : (
          selected.map((method) => (
            <NotifyMethodDetail
              key={method.id}
              method={method.id}
              name={method.name}
              prefs={draft}
              accountEmail={accountEmail}
              verifiedPhone={verifiedPhone}
              onChange={handleChange}
            />
          ))
        )}
      </div>

      <div className="mt-4.5 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        <small
          className={cn(
            "text-muted-foreground mr-auto text-xs max-sm:w-full",
            draft.methods.length === 0 && "text-[#b07d00]",
          )}
          data-testid="notify-hint"
        >
          {hint}
        </small>
        <Button variant="outline" onClick={handleReset} disabled={!dirty}>
          되돌리기
        </Button>
        <Button
          onClick={handleSave}
          disabled={!dirty}
          data-testid="notify-save"
        >
          저장
        </Button>
      </div>
    </article>
  );
}
