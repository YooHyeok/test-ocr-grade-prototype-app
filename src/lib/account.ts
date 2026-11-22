/**
 * 회원가입·가입 승인·내 정보 화면에서 쓰는 상수와 검사 함수.
 * 화면 기획 단계라 실제 인증·발송·저장은 하지 않는다.
 */
import type { NotifyMethod, NotifyPrefs, SignupType } from "@/type";

/** 데모 학원 코드 → 학원명 */
export const ACADEMY_CODES: Record<string, string> = {
  RAON: "라온 과학학원",
  BRIDGE: "브릿지 사이언스",
};

export const GRADES = ["중1", "중2", "중3", "고1", "고2", "고3"];

/** 가입 승인할 때 배정할 수 있는 클래스 */
export const CLASS_OPTIONS = ["중3 화학 심화", "고1 통합과학 A", "고2 화학 I"];

/** 가입 거절 사유 (마지막은 직접 입력) */
export const REJECT_REASONS = [
  "우리 학원 학생이 아닙니다",
  "이름이 등록 명단과 다릅니다",
  "중복 가입입니다",
];

/** 본인인증 인증번호 입력 제한 시간 (초) */
export const VERIFY_SECONDS = 180;

/** 알림 받는 방법. paid는 학원이 유료 발송을 연결해야 실제로 받을 수 있다. */
export const NOTIFY_METHODS: {
  id: NotifyMethod;
  name: string;
  description: string;
  paid: boolean;
}[] = [
  {
    id: "email",
    name: "이메일",
    description: "채점 결과·공지를 메일로 받아요",
    paid: false,
  },
  {
    id: "push",
    name: "앱 푸시",
    description: "이 기기 브라우저 알림으로 바로 받아요",
    paid: false,
  },
  {
    id: "sms",
    name: "문자 메시지",
    description: "휴대폰 문자로 받아요",
    paid: true,
  },
  {
    id: "kakao",
    name: "카카오톡",
    description: "카카오톡 알림톡으로 받아요",
    paid: true,
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/**
 * 이메일 형식인지 확인한다.
 * @param {string} value - 입력값
 * @returns {boolean}
 */
export function isEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * 휴대폰 번호 형식인지 확인한다. (하이픈 있어도 되고 없어도 됨)
 * @param {string} value - 입력값
 * @returns {boolean}
 */
export function isPhone(value: string) {
  return PHONE_PATTERN.test(value.trim());
}

/**
 * 비밀번호 규칙(8자 이상, 영문·숫자 포함)을 지키는지 확인한다.
 * @param {string} value - 비밀번호
 * @returns {boolean}
 */
export function isStrongPassword(value: string) {
  return PASSWORD_PATTERN.test(value);
}

/**
 * 휴대폰 번호를 010-1234-5678 형태로 바꾼다. 자릿수가 맞지 않으면 숫자만 돌려준다.
 * @param {string} phone - 숫자만 또는 하이픈 포함 번호
 * @returns {string}
 */
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11)
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
}

/**
 * 휴대폰 번호 가운데를 가린다. (010-****-5678)
 * @param {string} phone - 휴대폰 번호
 * @returns {string}
 */
export function maskPhone(phone: string) {
  const [head, , tail] = formatPhone(phone).split("-");
  return tail ? `${head}-****-${tail}` : formatPhone(phone);
}

/**
 * 학원 코드로 학원명을 찾는다. (대소문자 무시)
 * @param {string} code - 학원 코드
 * @returns {string | null} 학원명, 없으면 null
 */
export function findAcademy(code: string) {
  return ACADEMY_CODES[code.trim().toUpperCase()] ?? null;
}

/**
 * 학년에 맞는 클래스를 고른다. 맞는 클래스가 없으면 빈 문자열.
 * @param {string} grade - 학년 (예: 고2)
 * @returns {string}
 */
export function suggestClass(grade: string) {
  if (!grade) return "";
  return CLASS_OPTIONS.find((name) => name.startsWith(grade)) ?? "";
}

/** 회원가입 1단계 입력 */
export type SignupInfo = {
  type: SignupType;
  /** 학원 코드 확인을 마친 학원명 (확인 전이면 null) */
  academy: string | null;
  name: string;
  grade: string;
  email: string;
  password: string;
  passwordConfirm: string;
  /** 필수 약관에 모두 동의했는지 */
  agreed: boolean;
};

/**
 * 회원가입 1단계 입력을 검사한다. 화면 위에서부터 첫 번째 문제만 알려준다.
 * @param {SignupInfo} info - 입력값
 * @param {string[]} takenEmails - 이미 가입 신청한 이메일
 * @returns {string | null} 오류 문구, 문제가 없으면 null
 */
export function validateSignupInfo(info: SignupInfo, takenEmails: string[]) {
  const email = info.email.trim().toLowerCase();
  if (!info.academy) return "학원 코드를 입력하고 확인을 눌러주세요.";
  if (!info.name.trim()) return "이름을 입력해주세요.";
  if (info.type === "student" && !info.grade) return "학년을 선택해주세요.";
  if (!isEmail(email)) return "이메일 형식을 확인해주세요.";
  if (takenEmails.includes(email)) return "이미 가입 신청한 이메일입니다.";
  if (!isStrongPassword(info.password))
    return "비밀번호는 8자 이상, 영문과 숫자를 섞어주세요.";
  if (info.password !== info.passwordConfirm)
    return "비밀번호 확인이 일치하지 않습니다.";
  if (!info.agreed) return "필수 약관에 동의해주세요.";
  return null;
}

/**
 * 처음 알림 설정. 계정 이메일로 받는 이메일 알림만 켜 둔다.
 * @param {string} email - 계정 이메일
 * @returns {NotifyPrefs}
 */
export function defaultNotifyPrefs(email: string): NotifyPrefs {
  return {
    methods: ["email"],
    email,
    pushAllowed: false,
    sms: { useVerified: true, phone: "" },
    kakao: { useVerified: true, phone: "" },
  };
}

/**
 * 알림 설정을 저장하기 전에 검사한다. 고른 방법에 필요한 정보가 다 있는지 본다.
 * @param {NotifyPrefs} prefs - 알림 설정
 * @returns {string | null} 오류 문구, 문제가 없으면 null
 */
export function validateNotifyPrefs(prefs: NotifyPrefs) {
  const methods = new Set(prefs.methods);
  if (methods.has("email") && !isEmail(prefs.email))
    return "받을 이메일 주소를 확인해주세요.";
  if (methods.has("push") && !prefs.pushAllowed)
    return "앱 푸시를 받으려면 이 기기에서 알림을 허용해주세요.";
  const badPhone = (["sms", "kakao"] as const).some(
    (id) =>
      methods.has(id) && !prefs[id].useVerified && !isPhone(prefs[id].phone),
  );
  if (badPhone) return "받을 휴대폰 번호를 확인해주세요.";
  return null;
}

/**
 * 지금 시각을 "YYYY-MM-DD HH:MM"으로 만든다.
 * @param {Date} [date] - 기준 시각 (기본: 지금)
 * @returns {string}
 */
export function formatStamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
