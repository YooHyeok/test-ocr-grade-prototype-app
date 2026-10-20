/**
 * 구현 전 페이지 자리표시 컴포넌트.
 * @param {object} props
 * @param {string} props.title - 페이지 제목
 * @param {string} props.description - 기획 요약(docs/PRODUCT_PLAN.md 참조)
 * @returns {JSX.Element}
 */
export default function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </section>
  );
}
