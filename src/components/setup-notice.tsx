/**
 * Supabase 접속 정보(.env)가 없을 때 표시하는 설정 안내 화면.
 * @returns {JSX.Element}
 */
export default function SetupNotice() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <section className="surface w-full max-w-lg p-7">
        <p className="eyebrow">SETUP REQUIRED</p>
        <h1 className="mb-3 text-xl font-bold">
          Supabase 연결 설정이 필요합니다
        </h1>
        <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm">
          <li>
            Supabase 프로젝트를 만들고 supabase/migrations의 SQL을 적용합니다.
          </li>
          <li>
            프로젝트 루트의{" "}
            <code className="text-foreground">.env.example</code>을{" "}
            <code className="text-foreground">.env</code>로 복사합니다.
          </li>
          <li>
            <code className="text-foreground">VITE_SUPABASE_URL</code>,{" "}
            <code className="text-foreground">
              VITE_SUPABASE_PUBLISHABLE_KEY
            </code>
            를 입력하고 개발 서버를 다시 실행합니다.
          </li>
        </ol>
        <a
          href="/prototype/index.html"
          target="_blank"
          rel="noreferrer"
          className="text-primary mt-5 inline-block text-sm font-semibold hover:underline"
        >
          설정 전에는 기획 프로토타입에서 화면 확인하기 →
        </a>
      </section>
    </div>
  );
}
