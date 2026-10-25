import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  /** green: 완료 지표, coral: 주의 지표 */
  tone: "green" | "coral";
  label: string;
  value: number;
  unit: string;
  /** 우측 보조 영역 (증감률, 바로가기 링크 등) */
  extra?: ReactNode;
};

/**
 * 대시보드 통계 카드 하나.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  unit,
  extra,
}: Readonly<Props>) {
  return (
    <article className="bg-card grid grid-cols-[43px_1fr_auto] items-center gap-3 rounded-2xl px-4.5 py-6 shadow-[0_6px_16px_rgba(58,70,64,.035)]">
      <span
        className={cn(
          "grid size-[42px] place-items-center rounded-[13px]",
          tone === "green"
            ? "bg-mint-soft text-primary"
            : "bg-coral-soft text-coral-strong",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-muted-foreground mb-0.5 text-xs">{label}</p>
        <strong className="text-2xl">
          {value}
          <small className="text-xs font-medium"> {unit}</small>
        </strong>
      </div>
      {extra}
    </article>
  );
}
