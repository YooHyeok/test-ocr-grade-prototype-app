/**
 * 페이지 코드를 불러오는 동안 본문 영역에 표시하는 로딩 표시. (레이아웃은 유지)
 * @returns {JSX.Element}
 */
export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="화면 불러오는 중"
      className="flex justify-center py-20"
    >
      <span className="border-mint border-t-primary size-8 animate-spin rounded-full border-4" />
    </div>
  );
}
