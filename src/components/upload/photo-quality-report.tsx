import { useMemo } from "react";
import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import type { PhotoIssueCode, PhotoQuality } from "@/lib/photo-quality";
import { cn } from "@/lib/utils";

type Props = {
  quality: PhotoQuality;
};

/** 검사 항목 (표시 순서) */
const CHECKS: {
  label: string;
  codes: PhotoIssueCode[];
  value: (q: PhotoQuality) => string;
}[] = [
  {
    label: "밝기",
    codes: ["too_dark", "too_bright"],
    value: (q) => `${Math.round(q.metrics.brightness)} / 255`,
  },
  {
    label: "선명도 (흔들림)",
    codes: ["blurry"],
    value: (q) => Math.round(q.metrics.sharpness).toLocaleString(),
  },
  {
    label: "빛 반사",
    codes: ["glare"],
    value: (q) => `${(q.metrics.glareRatio * 100).toFixed(1)}%`,
  },
  {
    label: "글씨 대비",
    codes: ["low_contrast"],
    value: (q) => Math.round(q.metrics.contrast).toString(),
  },
  {
    label: "해상도",
    codes: ["low_resolution"],
    value: (q) => `${q.metrics.width}×${q.metrics.height}`,
  },
];

const LEVEL_STYLE = {
  ok: { icon: CircleCheck, tone: "text-primary" },
  warning: { icon: CircleAlert, tone: "text-[#b07d00]" },
  error: { icon: CircleX, tone: "text-destructive" },
} as const;

/**
 * 사진 품질 검사 결과. 항목별 통과·경고·오류와 안내 문구를 보여준다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PhotoQualityReport({ quality }: Readonly<Props>) {
  const rows = useMemo(
    () =>
      CHECKS.map((check) => {
        const issue = quality.issues.find((item) =>
          check.codes.includes(item.code),
        );
        return { ...check, issue, level: issue?.level ?? ("ok" as const) };
      }),
    [quality],
  );
  let headline = "촬영 상태가 좋습니다";
  if (!quality.ok) headline = "다시 찍어주세요";
  else if (quality.issues.length > 0)
    headline = "업로드할 수 있지만 확인이 필요합니다";

  return (
    <section
      aria-label="촬영 품질 검사 결과"
      className={cn(
        "grid gap-2 rounded-[10px] border p-3.5",
        quality.ok
          ? "border-[#cfe3d9] bg-[#f6fbf8]"
          : "border-coral/40 bg-[#fff7f5]",
      )}
    >
      <strong
        className={cn(
          "text-[13px]",
          quality.ok ? "text-primary" : "text-coral-strong",
        )}
      >
        {headline}
      </strong>
      <ul className="grid gap-1.5">
        {rows.map((row) => {
          const { icon: Icon, tone } = LEVEL_STYLE[row.level];
          return (
            <li
              key={row.label}
              className="grid grid-cols-[18px_1fr_auto] items-start gap-2 text-xs"
            >
              <Icon
                className={cn("mt-px size-4", tone)}
                aria-label={row.level}
              />
              <span className="grid gap-0.5">
                <span className="font-bold text-[#3c4943]">{row.label}</span>
                {row.issue && <span className={tone}>{row.issue.message}</span>}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {row.value(quality)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
