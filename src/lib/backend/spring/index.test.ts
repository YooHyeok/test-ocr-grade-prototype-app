import { afterEach, describe, expect, it, vi } from "vitest";
import { createSpringBackend } from "./index";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => vi.unstubAllGlobals());

describe("Spring 백엔드", () => {
  it("로그인 요청의 401은 계정 정보 불일치(invalid_credentials)로 안내한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(json(401, {}))),
    );
    const backend = createSpringBackend({ baseUrl: "https://api.example.com" });

    await expect(
      backend.auth.signInWithPassword({ email: "a@b.c", password: "x" }),
    ).rejects.toMatchObject({
      code: "invalid_credentials",
    });
  });

  it("로그인 후 프로필 조회에 토큰을 사용하고, 401이면 로그아웃 상태로 전환한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        json(200, {
          accessToken: "token-1",
          user: { id: "u-1", email: "a@b.c" },
        }),
      )
      .mockResolvedValueOnce(json(401, {}));
    vi.stubGlobal("fetch", fetchMock);
    const backend = createSpringBackend({ baseUrl: "https://api.example.com" });
    const listener = vi.fn();
    backend.auth.onSessionChange(listener);

    await backend.auth.signInWithPassword({ email: "a@b.c", password: "x" });
    await expect(backend.profile.fetchById("u-1")).rejects.toMatchObject({
      code: "session_expired",
    });

    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer token-1" });
    // 구독 직후 현재 세션(null) → 로그인 → 401로 로그아웃(null)
    expect(
      listener.mock.calls.map(([session]) => session?.user.id ?? null),
    ).toEqual([null, "u-1", null]);
  });
});
