/**
 * 구현 전 페이지 자리표시 컴포넌트. 기획 프로토타입으로 이동하는 링크를 제공한다.
 * @returns {JSX.Element}
 */
export default function PagePlaceholder() {
  return (
    <section className="text-muted-foreground bg-card grid place-items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center text-sm">
      <p>이 화면은 아직 구현 전입니다.</p>
      <a
        href="/prototype/index.html"
        target="_blank"
        rel="noreferrer"
        className="text-primary font-semibold hover:underline"
      >
        기획 프로토타입에서 보기 →
      </a>
    </section>
  );
}
