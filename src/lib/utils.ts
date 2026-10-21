import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind 클래스명을 조건부로 결합하고 충돌하는 유틸리티 클래스를 병합한다.
 * @param {...ClassValue} inputs - 결합할 클래스 값 목록
 * @returns {string} 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
