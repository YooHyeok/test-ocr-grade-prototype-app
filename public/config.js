/**
 * 런타임 설정. index.html에서 앱 스크립트보다 먼저 로드된다.
 * 배포 후에도 이 파일만 수정하면 다시 빌드하지 않고 설정을 바꿀 수 있다.
 *
 * 주의: 브라우저에 그대로 공개되는 파일이다.
 *       공개 가능한 값(Supabase publishable key, API 주소 등)만 넣고,
 *       service role 키나 Google 인증 키 같은 비밀값은 절대 넣지 않는다.
 *
 * 비워 둔 값은 .env(VITE_*) 값을 사용한다.
 */
const config = {
  /** 사용할 백엔드: "supabase" | "spring" | "mock" (mock: 백엔드 없이 데모 계정으로 화면 확인) */
  backend: "supabase",

  supabase: {
    /** 예: https://xxxx.supabase.co (비우면 VITE_SUPABASE_URL) */
    url: "",
    /** 비우면 VITE_SUPABASE_PUBLISHABLE_KEY */
    publishableKey: "",
  },

  spring: {
    /** Spring REST API 주소. 예: https://api.example.com (비우면 VITE_SPRING_API_URL) */
    baseUrl: "",
  },
};
