import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** done: 초록(완료/주 담당), review: 코랄(검토 필요/보조) */
  tone: "done" | "review";
  children: ReactNode;
};

/**
 * 상태 표시 배지. (채점 상태, 담당 역할 등)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StatusBadge({ tone, children }: Readonly<Props>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-[11px] font-bold",
        tone === "done"
          ? "bg-mint-soft text-primary"
          : "bg-coral-soft text-coral-strong",
      )}
    >
      {children}
    </span>
  );
}
