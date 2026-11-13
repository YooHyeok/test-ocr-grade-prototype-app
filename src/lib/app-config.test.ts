import { describe, expect, it } from "vitest";
import { isBackendConfigured, type AppConfig } from "./app-config";

/**
 * 테스트용 설정을 만든다.
 * @param {Partial<AppConfig>} overrides - 바꿀 값
 * @returns {AppConfig}
 */
function makeConfig(overrides: Partial<AppConfig>): AppConfig {
  return {
    backend: "supabase",
    supabase: { url: "", publishableKey: "" },
    spring: { baseUrl: "" },
    ...overrides,
  };
}

describe("isBackendConfigured", () => {
  it("mock은 접속 정보 없이도 사용할 수 있다", () => {
    expect(isBackendConfigured(makeConfig({ backend: "mock" }))).toBe(true);
  });

  it("supabase는 URL과 publishable key가 모두 있어야 한다", () => {
    expect(
      isBackendConfigured(
        makeConfig({
          supabase: { url: "https://x.supabase.co", publishableKey: "" },
        }),
      ),
    ).toBe(false);
    expect(
      isBackendConfigured(
        makeConfig({
          supabase: { url: "https://x.supabase.co", publishableKey: "key" },
        }),
      ),
    ).toBe(true);
  });

  it("spring은 API 주소가 있어야 한다", () => {
    expect(isBackendConfigured(makeConfig({ backend: "spring" }))).toBe(false);
    expect(
      isBackendConfigured(
        makeConfig({
          backend: "spring",
          spring: { baseUrl: "https://api.example.com" },
        }),
      ),
    ).toBe(true);
  });
});
