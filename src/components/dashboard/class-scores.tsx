type Props = {
  classes: { className: string; average: number; papers: number }[];
};

/**
 * 클래스별 이번 달 평균 점수 가로 막대. 75점 미만은 주의 색으로 표시한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ClassScores({ classes }: Readonly<Props>) {
  return (
    <section className="surface grid content-start gap-4 p-5">
      <div>
        <p className="eyebrow">THIS MONTH</p>
        <h3 className="font-bold">클래스별 평균 점수</h3>
      </div>
      <ul className="grid gap-3.5">
        {classes.map((item) => (
          <li key={item.className} className="grid gap-1.5">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-bold text-[#3c4943]">{item.className}</span>
              <span className="text-muted-foreground tabular-nums">
                <strong className="text-foreground text-sm">
                  {item.average}
                </strong>
                점 · {item.papers}장
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef2ef]">
              <div
                className={
                  item.average < 75
                    ? "bg-coral h-full rounded-full"
                    : "bg-primary h-full rounded-full"
                }
                style={{ width: `${item.average}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
