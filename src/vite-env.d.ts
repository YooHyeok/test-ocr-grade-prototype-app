/// <reference types="vite/client" />

/** .env 값. public/config.js에 값이 없을 때만 사용한다. (src/lib/app-config.ts) */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SPRING_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
