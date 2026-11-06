/**
 * public/config.js 가 전역에 선언하는 런타임 설정 객체.
 * 일반 <script>의 최상위 const 선언은 전역 바인딩이 되므로 window 없이 `config`로 접근한다.
 * 파일이 없을 수도 있으므로 직접 쓰지 말고 src/lib/app-config.ts 를 통해 읽는다.
 */
declare const config:
  | {
      backend?: "supabase" | "spring" | "mock";
      supabase?: { url?: string; publishableKey?: string };
      spring?: { baseUrl?: string };
    }
  | undefined;
