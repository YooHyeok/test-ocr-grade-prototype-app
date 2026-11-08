import { appConfig, type AppConfig } from "@/lib/app-config";
import type { Backend } from "./types";
import { createSupabaseBackend } from "./supabase";
import { createSpringBackend } from "./spring";
import { createMockBackend } from "./mock";

/**
 * 설정값(public/config.js의 backend)에 맞는 백엔드 구현체를 만든다.
 * @param {AppConfig} target - 앱 설정
 * @returns {Backend}
 */
function createBackend(target: AppConfig): Backend {
  switch (target.backend) {
    case "spring":
      return createSpringBackend(target.spring);
    case "mock":
      return createMockBackend();
    case "supabase":
      return createSupabaseBackend(target.supabase);
  }
}

/** 앱 전체에서 사용하는 백엔드 (api/* 에서만 직접 사용한다) */
export const backend = createBackend(appConfig);
