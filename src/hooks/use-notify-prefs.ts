import { useCallback, useState } from "react";
import { defaultNotifyPrefs } from "@/lib/account";
import type { NotifyPrefs } from "@/type";

const STORAGE_PREFIX = "notify-prefs:";

/**
 * 저장된 알림 설정을 읽는다. 없거나 읽지 못하면 기본값.
 * @param {string} key - 저장소 키
 * @param {string} email - 기본으로 받을 계정 이메일
 * @returns {NotifyPrefs}
 */
function readPrefs(key: string, email: string): NotifyPrefs {
  const fallback = defaultNotifyPrefs(email);
  try {
    const raw = localStorage.getItem(key);
    return raw
      ? { ...fallback, ...(JSON.parse(raw) as Partial<NotifyPrefs>) }
      : fallback;
  } catch {
    return fallback;
  }
}

/**
 * 학생의 알림 받는 방법 설정. 화면 기획 단계라 이 브라우저에만 저장한다.
 * TODO: backend 계약(알림 설정 조회·저장)으로 옮기기
 * @param {string} userId - 사용자 id (사용자별로 따로 저장)
 * @param {string} email - 처음 설정의 받을 이메일 (계정 이메일)
 * @returns {[NotifyPrefs, (prefs: NotifyPrefs) => void]} 저장된 설정, 저장 함수
 */
export function useNotifyPrefs(userId: string, email: string) {
  const key = `${STORAGE_PREFIX}${userId}`;
  const [saved, setSaved] = useState(() => readPrefs(key, email));

  const save = useCallback(
    (prefs: NotifyPrefs) => {
      setSaved(prefs);
      try {
        localStorage.setItem(key, JSON.stringify(prefs));
      } catch {
        // 저장소를 쓸 수 없으면 새로고침 시 처음 설정으로 돌아간다.
      }
    },
    [key],
  );

  return [saved, save] as const;
}
