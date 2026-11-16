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

  it("시스템 설정은 관리자만 보고 바꿀 수 있다", async () => {
    const backend = createMockBackend();
    await backend.auth.signInWithPassword({
      email: "student@demo.com",
      password: "demo1234",
    });
    await expect(backend.systemSettings.list()).resolves.toEqual([]);
    await expect(
      backend.systemSettings.updateValues([
        { key: "WM.MAIL_BATCH.ENABLED", value: "true" },
      ]),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("관리자는 그룹·설정을 추가·수정·삭제하고, 변경 이력을 검색한다", async () => {
    const backend = createMockBackend();
    await backend.auth.signInWithPassword({
      email: "teacher@demo.com",
      password: "demo1234",
    });
    const settings = backend.systemSettings;

    await expect(
      settings.createGroup({ id: "NOPE.OCR", name: "x", description: null }),
    ).rejects.toMatchObject({ code: "in_use" });
    await settings.createGroup({
      id: "WM.OCR",
      name: "OCR",
      description: null,
    });
    await expect(
      settings.createGroup({ id: "WM.OCR", name: "중복", description: null }),
    ).rejects.toMatchObject({ code: "conflict" });

    const input = {
      key: "WM.OCR.MIN_CONFIDENCE",
      groupId: "WM",
      subGroupId: "WM.OCR",
      name: "최소 신뢰도",
      description: null,
      type: "NUM" as const,
      value: "0.85",
      options: null,
      access: "W" as const,
    };
    await expect(
      settings.create({ ...input, key: "WM.OTHER.X" }),
    ).rejects.toMatchObject({ code: "invalid_value" });
    await settings.create(input);
    await expect(
      settings.create({ ...input, key: "WM.OCR.BAD", value: "abc" }),
    ).rejects.toMatchObject({ code: "invalid_value" });
    await expect(settings.deleteGroup("WM.OCR")).rejects.toMatchObject({
      code: "in_use",
    });
    await expect(settings.deleteGroup("WM")).rejects.toMatchObject({
      code: "in_use",
    });

    // 한 건이라도 잘못되면 아무것도 반영하지 않는다.
    await expect(
      settings.updateValues([
        { key: "WM.OCR.MIN_CONFIDENCE", value: "0.9" },
        { key: "WM.MAIL_BATCH.ENABLED", value: "Y" },
      ]),
    ).rejects.toMatchObject({ code: "invalid_value" });
    await settings.updateValues([
      { key: "WM.OCR.MIN_CONFIDENCE", value: "0.9" },
    ]);
    await settings.remove("WM.OCR.MIN_CONFIDENCE");
    await settings.deleteGroup("WM.OCR");

    expect((await settings.list()).map((item) => item.key)).toEqual([
      "WM.MAIL_BATCH.CYCLE",
      "WM.MAIL_BATCH.ENABLED",
    ]);
    const page = await settings.listHistories({
      date: null,
      groupId: "WM",
      key: "min_conf",
      page: 1,
      pageSize: 2,
    });
    expect(page.total).toBe(3);
    expect(
      page.items.map((item) => [item.action, item.prevValue, item.nowValue]),
    ).toEqual([
      ["D", "0.9", null],
      ["U", "0.85", "0.9"],
    ]);
    expect(page.items[0].changedBy).toBe("전선생");
  });
});
