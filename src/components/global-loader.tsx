/**
 * 세션·프로필 확인 중 전체 화면 로딩 표시.
 * @returns {JSX.Element}
 */
export default function GlobalLoader() {
  return (
    <div className="bg-background flex h-screen w-screen items-center justify-center">
      <div className="animate-bounce text-center">
        <strong className="text-primary block text-2xl">쪽지시험</strong>
        <span className="text-muted-foreground text-xs">
          OCR 채점 관리
        </span>
      </div>
    </div>
  );
}
