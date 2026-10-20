import path from "path";
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prototypeRedirect()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
