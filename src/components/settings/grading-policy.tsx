type Props = {
  policies: string[];
};

/**
 * 채점 정책 설정 카드.
 * TODO: 학원 설정 테이블과 연동해 저장
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function GradingPolicy({ policies }: Props) {
  return (
    <section className="surface mt-5.5 grid gap-3.5 p-5">
      <h3 className="mb-1 font-bold">채점 정책</h3>
      {policies.map((policy) => (
        <label
          key={policy}
          className="flex items-center gap-2 text-[13px] text-[#596660]"
        >
          <input type="checkbox" defaultChecked className="accent-primary" />
          {policy}
        </label>
      ))}
    </section>
  );
}
