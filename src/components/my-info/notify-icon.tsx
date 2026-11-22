import { Bell, Mail, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotifyMethod } from "@/type";

type Props = {
  method: NotifyMethod;
  /** 작게(입력 영역 제목 옆) */
  small?: boolean;
  className?: string;
};

const STYLE: Record<NotifyMethod, string> = {
  email: "bg-[#3f7fd8] text-white",
  push: "bg-primary text-white",
  sms: "bg-[#7a62d6] text-white",
  kakao: "bg-[#fee500] text-[#3b1e1e]",
};

/**
 * 알림 방법 아이콘 (색 네모 + 기호). 카카오톡은 노란 바탕에 TALK.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function NotifyIcon({
  method,
  small,
  className,
}: Readonly<Props>) {
  const iconSize = small ? "size-3.5" : "size-5";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center font-extrabold",
        small
          ? "size-6 rounded-[7px] text-[7px]"
          : "size-9.5 rounded-[10px] text-[10px]",
        STYLE[method],
        className,
      )}
    >
      {method === "email" && <Mail className={iconSize} />}
      {method === "push" && <Bell className={iconSize} />}
      {method === "sms" && <MessageSquareText className={iconSize} />}
      {method === "kakao" && "TALK"}
    </span>
  );
}
