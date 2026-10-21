/**
 * 하단 푸터. 기획 프로토타입 링크를 함께 제공한다.
 * @returns {JSX.Element}
 */
export default function Footer() {
  return (
    <footer className="text-muted-foreground/70 mt-auto flex justify-between pt-5.5 text-[10px] max-sm:pb-2.5">
      <a
        href="/prototype/index.html"
        target="_blank"
        rel="noreferrer"
        className="hover:underline"
      >
        기획 프로토타입 보기
      </a>
      <span>Google OCR · Supabase ready</span>
    </footer>
  );
}
