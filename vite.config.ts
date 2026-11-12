import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * `/prototype`, `/prototype/` 요청을 기획 프로토타입(public/prototype/index.html)으로 리다이렉트한다.
 * 리다이렉트가 없으면 SPA fallback에 걸려 React 앱이 렌더링된다.
 * @returns {Plugin} Vite 플러그인
 */
function prototypeRedirect(): Plugin {
  const redirect = (req: any, res: any, next: () => void) => {
    if (req.url === "/prototype" || req.url === "/prototype/") {
      res.writeHead(302, { Location: "/prototype/index.html" });
      res.end();
      return;
    }
    next();
  };
  return {
    name: "prototype-redirect",
    configureServer(server) {
      server.middlewares.use(redirect);
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect);
    },
  };
}

/** 라이브러리 청크 묶음. 앱 코드가 바뀌어도 라이브러리 파일은 브라우저 캐시를 그대로 쓴다. */
const VENDOR_CHUNKS: Record<string, string[]> = {
  "vendor-react": ["react", "react-dom", "react-router", "scheduler"],
  "vendor-supabase": ["@supabase"],
  "vendor-query": ["@tanstack"],
  "vendor-ui": [
    "@radix-ui",
    "lucide-react",
    "sonner",
    "embla-carousel",
    "class-variance-authority",
    "tailwind-merge",
    "clsx",
  ],
};

/**
 * node_modules 모듈을 라이브러리별 청크로 나눈다.
 * @param {string} id - 모듈 경로
 * @returns {string | undefined} 청크 이름 (해당 없으면 Vite 기본 분할)
 */
function vendorChunk(id: string) {
  const normalized = id.replaceAll("\\", "/");
  if (!normalized.includes("/node_modules/")) return undefined;
  const packagePath = normalized.split("/node_modules/").pop() ?? "";
  return Object.entries(VENDOR_CHUNKS).find(([, packages]) =>
    packages.some(
      (name) =>
        packagePath === name ||
        packagePath.startsWith(`${name}/`) ||
        packagePath.startsWith(`${name}-`),
    ),
  )?.[0];
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prototypeRedirect()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: { manualChunks: vendorChunk },
    },
  },
});
