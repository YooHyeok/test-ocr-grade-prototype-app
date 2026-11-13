import { describe, expect, it, vi } from "vitest";
import { BackendError } from "../types";
import { createMockBackend } from "./index";

/** 마이크로태스크로 전달되는 세션 알림이 처리될 때까지 기다린다. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("mock 백엔드", () => {
  it("데모 계정이 아니면 invalid_credentials 오류를 던진다", async () => {
    const backend = createMockBackend();
    const error = await backend.auth
      .signInWithPassword({ email: "teacher@demo.com", password: "wrong" })
      .catch((e) => e);
    expect(error).toBeInstanceOf(BackendError);
    expect(error.code).toBe("invalid_credentials");
  });

  it("로그인·로그아웃이 구독자에게 순서대로 전달된다", async () => {
    const backend = createMockBackend();
    const listener = vi.fn();
    backend.auth.onSessionChange(listener);
    await flush();

    await backend.auth.signInWithPassword({
      email: "Teacher@Demo.com",
      password: "demo1234",
    });
    await backend.auth.signOut();

    expect(
      listener.mock.calls.map(([session]) => session?.user.id ?? null),
    ).toEqual([null, "mock-teacher", null]);
  });

  it("구독 해제 후에는 알림을 받지 않는다", async () => {
    const backend = createMockBackend();
    const listener = vi.fn();
    const unsubscribe = backend.auth.onSessionChange(listener);
    await flush();
    unsubscribe();

    await backend.auth.signInWithPassword({
      email: "student@demo.com",
      password: "demo1234",
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("프로필을 조회하고, 없는 id는 not_found 오류를 던진다", async () => {
    const backend = createMockBackend();
    await expect(
      backend.profile.fetchById("mock-student"),
    ).resolves.toMatchObject({ role: "student" });
    await expect(backend.profile.fetchById("nobody")).rejects.toMatchObject({
      code: "not_found",
    });
  });
});
