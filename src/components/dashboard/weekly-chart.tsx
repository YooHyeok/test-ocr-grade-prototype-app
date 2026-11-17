import { useMemo } from "react";

type Props = {
  data: { day: string; completed: number; review: number }[];
};

/**
 * 이번 주 요일별 채점 건수 막대 그래프 (완료 + 검토 필요 누적).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function WeeklyChart({ data }: Readonly<Props>) {
  const max = useMemo(
    () => Math.max(...data.map((item) => item.completed + item.review), 1),
    [data],
  );
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.completed + item.review, 0),
    [data],
  );

  return (
    <section className="surface grid gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">THIS WEEK</p>
          <h3 className="font-bold">이번 주 채점 현황</h3>
        </div>
        <p className="text-muted-foreground text-xs">
          총{" "}
          <strong className="text-foreground text-base tabular-nums">
            {total}
          </strong>
          장
        </p>
      </div>

      <div className="flex h-40 items-end gap-3 border-b border-[#eef0ee] pb-0.5">
        {data.map((item) => {
          const count = item.completed + item.review;
          return (
            <div
              key={item.day}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-[11px] font-bold text-[#56635e] tabular-nums">
                {count}
              </span>
              <div
                className="flex w-full max-w-9 flex-col overflow-hidden rounded-t-md"
                style={{ height: `${(count / max) * 100}%` }}
                title={`${item.day}: 완료 ${item.completed}장, 검토 필요 ${item.review}장`}
              >
                <span className="bg-coral" style={{ flexGrow: item.review }} />
                <span
                  className="bg-primary"
                  style={{ flexGrow: item.completed }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        {data.map((item) => (
          <span
            key={item.day}
            className="text-muted-foreground flex-1 text-center text-[11px]"
          >
            {item.day}
          </span>
        ))}
      </div>

      <div className="text-muted-foreground flex gap-4 text-[11px]">
        <span className="flex items-center gap-1.5">
          <i className="bg-primary size-2.5 rounded-sm" />
          채점 완료
        </span>
        <span className="flex items-center gap-1.5">
          <i className="bg-coral size-2.5 rounded-sm" />
          검토 필요
        </span>
      </div>
    </section>
  );
}
