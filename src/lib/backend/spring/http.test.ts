import { afterEach, describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./http";

/**
 * fetch를 지정한 응답으로 바꾼다.
 * @param {Response | Error} result - 돌려줄 응답 또는 던질 오류
 * @returns {import("vitest").Mock} fetch 모의 함수
 */
function mockFetch(result: Response | Error) {
  const fetchMock = vi.fn(() =>
    result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => vi.unstubAllGlobals());

describe("Spring HTTP 클라이언트", () => {
  const request = createHttpClient("https://api.example.com");

  it("주소를 이어 붙이고 토큰을 Authorization 헤더로 보낸다", async () => {
    const fetchMock = mockFetch(json(200, { ok: true }));
    await expect(request("/api/profiles/1", { token: "abc" })).resolves.toEqual(
      { ok: true },
    );

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe("https://api.example.com/api/profiles/1");
    expect(init.headers).toMatchObject({ Authorization: "Bearer abc" });
  });

  it("본문이 있으면 JSON으로 보낸다", async () => {
    const fetchMock = mockFetch(json(200, {}));
    await request("/api/auth/login", {
      method: "POST",
      body: { email: "a@b.c" },
    });

    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(init.body).toBe(JSON.stringify({ email: "a@b.c" }));
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("204 응답은 undefined를 반환한다", async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(
      request("/api/auth/logout", { method: "POST" }),
    ).resolves.toBeUndefined();
  });

  it("응답 본문의 code를 공통 오류 코드로 사용한다", async () => {
    mockFetch(json(401, { code: "invalid_credentials", message: "bad" }));
    await expect(request("/api/auth/login")).rejects.toMatchObject({
      code: "invalid_credentials",
      message: "bad",
    });
  });

  it("code가 없으면 HTTP 상태 코드로 판단한다", async () => {
    mockFetch(json(401, {}));
    await expect(request("/x")).rejects.toMatchObject({
      code: "session_expired",
    });
    mockFetch(new Response("not json", { status: 429 }));
    await expect(request("/x")).rejects.toMatchObject({ code: "rate_limited" });
    mockFetch(json(500, { code: "something_else" }));
    await expect(request("/x")).rejects.toMatchObject({ code: "unknown" });
  });

  it("네트워크 오류는 unknown 오류로 바꾼다", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    await expect(request("/x")).rejects.toMatchObject({
      code: "unknown",
      message: "서버에 연결할 수 없습니다.",
    });
  });
});
