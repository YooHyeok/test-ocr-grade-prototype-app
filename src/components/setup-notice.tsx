import { appConfig } from "@/lib/app-config";

/** 백엔드별 필요한 설정 항목 (public/config.js 키 / .env 키) */
const REQUIRED_SETTINGS: Record<
  "supabase" | "spring",
  { config: string; env: string }[]
> = {
  supabase: [
    { config: "supabase.url", env: "VITE_SUPABASE_URL" },
    { config: "supabase.publishableKey", env: "VITE_SUPABASE_PUBLISHABLE_KEY" },
  ],
  spring: [{ config: "spring.baseUrl", env: "VITE_SPRING_API_URL" }],
};

/**
 * 선택한 백엔드의 접속 정보가 없을 때 표시하는 설정 안내 화면.
 * @returns {JSX.Element}
 */
export default function SetupNotice() {
  const backendName = appConfig.backend === "spring" ? "spring" : "supabase";
  const settings = REQUIRED_SETTINGS[backendName];

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <section className="surface w-full max-w-lg p-7">
        <p className="eyebrow">SETUP REQUIRED</p>
        <h1 className="mb-3 text-xl font-bold">
          백엔드 연결 설정이 필요합니다{" "}
          <span className="text-muted-foreground text-base">
            ({backendName})
          </span>
        </h1>
        <ol className="text-muted-foreground list-decimal space-y-1.5 pl-5 text-sm">
          <li>
            <code className="text-foreground">public/config.js</code>의{" "}
            <code className="text-foreground">backend</code>에서 사용할 백엔드를
            고릅니다.
          </li>
          <li>
            아래 값을 <code className="text-foreground">public/config.js</code>
            에 넣거나, 비워 두고 <code className="text-foreground">.env</code>에
            입력합니다.
            <ul className="mt-1 list-disc pl-5">
              {settings.map((item) => (
                <li key={item.config}>
                  <code className="text-foreground">{item.config}</code> 또는{" "}
                  <code className="text-foreground">{item.env}</code>
                </li>
              ))}
            </ul>
          </li>
          <li>
            백엔드 없이 화면만 보려면{" "}
            <code className="text-foreground">backend: "mock"</code>으로 바꾸고
            데모 계정으로 로그인합니다.
          </li>
        </ol>
        <a
          href="/prototype/index.html"
          target="_blank"
          rel="noreferrer"
          className="text-primary mt-5 inline-block text-sm font-semibold hover:underline"
        >
          기획 프로토타입에서 화면 확인하기 →
        </a>
      </section>
    </div>
  );
}
