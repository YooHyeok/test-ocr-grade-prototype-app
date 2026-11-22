import { memo, type ChangeEvent } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotifyMethod } from "@/type";
import NotifyIcon from "./notify-icon";

type Props = {
  id: NotifyMethod;
  name: string;
  description: string;
  /** 학원이 유료 발송을 연결해야 받을 수 있는 방법 */
  paid: boolean;
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/**
 * 알림 받는 방법 선택 칸 하나 (체크박스 카드). 무료/준비 중 표시를 단다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
function NotifyMethodOption({
  id,
  name,
  description,
  paid,
  checked,
  onChange,
}: Readonly<Props>) {
  return (
    <label
      className={cn(
        "has-focus-visible:outline-primary relative grid cursor-pointer grid-cols-[38px_minmax(0,1fr)] items-center gap-x-2.75 gap-y-1 rounded-[11px] border-[1.5px] border-[#dfe5e2] bg-white px-3.5 py-3.25 transition-colors hover:border-[#a9cdbf] has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
        checked && "border-primary hover:border-primary bg-[#f3faf6]",
      )}
    >
      <input
        type="checkbox"
        value={id}
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0"
        data-testid={`notify-${id}`}
      />
      <NotifyIcon method={id} className="row-span-2" />
      <span className="grid gap-0.5 pr-5.5">
        <strong className="text-sm">{name}</strong>
        <small className="text-muted-foreground text-xs leading-snug">
          {description}
        </small>
      </span>
      <em
        className={cn(
          "col-start-2 justify-self-start rounded-full px-1.75 py-0.5 text-[10px] font-bold not-italic",
          paid ? "bg-[#fff1cc] text-[#8a6100]" : "bg-mint-soft text-primary",
        )}
      >
        {paid ? "준비 중" : "무료"}
      </em>
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-3 right-3 grid size-4.5 place-items-center rounded-[5px] border-[1.5px] border-[#c8d1cd] bg-white",
          checked && "border-primary bg-primary text-white",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
    </label>
  );
}

export default memo(NotifyMethodOption);
