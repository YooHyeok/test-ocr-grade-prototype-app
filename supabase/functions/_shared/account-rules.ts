/**
 * 계정 관리 규칙 (서버 함수 account-admin·auth-login과 mock 백엔드 공용 순수 함수).
 * 설계: docs/superpowers/specs/2026-11-24-account-signup-design.md
 *   - 관리자는 같은 학원 선생님·학생, 선생님은 같은 학원 학생 계정만 만들고 잠금을 푼다.
 *   - 직접 만든 계정은 임시 비밀번호로 시작하고 첫 로그인 때 비밀번호를 바꾼다.
 *   - 비밀번호를 5회 연속 틀리면 잠근다. 관리자는 잠그지 않는다.
 */

/** 계정 권한 */
export type AccountRole = "teacher" | "student";

/** 요청한 사람 (로그인 사용자) */
export type AccountActor = {
  role: AccountRole;
  isAdmin: boolean;
  academyId: string | null;
  locked: boolean;
};

/** 계정 직접 추가 입력 */
export type CreateAccountInput = {
  role: AccountRole;
  name: string;
  email: string;
  /** 학생만 */
  grade: string;
  /** 학생만 (필수) */
  classId: string | null;
  phone: string | null;
};

/** 규칙 위반 (code는 프론트 공통 오류 코드) */
export type RuleError = {
  code: "forbidden" | "invalid_value";
  message: string;
};

/** 비밀번호 연속 실패 허용 횟수 (이 횟수째 실패하면 잠김) */
export const MAX_LOGIN_FAILURES = 5;

/** 임시 비밀번호 글자 (헷갈리는 0·O·1·l·I 제외) */
const LETTERS = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";

/**
 * 임시 비밀번호를 만든다. 12자, 영문·숫자를 반드시 섞는다. (가입 비밀번호 규칙: 8자 이상, 영문·숫자 포함)
 * @param {(max: number) => number} randomInt - 0 이상 max 미만 정수를 고르는 함수 (서버는 crypto 난수)
 * @returns {string}
 */
export function generateTempPassword(randomInt: (max: number) => number) {
  const all = LETTERS + DIGITS;
  const chars = [
    LETTERS[randomInt(LETTERS.length)],
    DIGITS[randomInt(DIGITS.length)],
    ...Array.from({ length: 10 }, () => all[randomInt(all.length)]),
  ];
  // 섞기 (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/**
 * 계정 관리를 할 수 있는 사람인지 확인한다. (잠기지 않은, 학원 소속 선생님)
 * @param {AccountActor} actor - 요청한 사람
 * @returns {RuleError | null}
 */
function checkManager(actor: AccountActor): RuleError | null {
  if (actor.locked || !actor.academyId || actor.role !== "teacher")
    return { code: "forbidden", message: "계정을 관리할 권한이 없습니다." };
  return null;
}

/**
 * 해당 권한의 계정을 관리(추가·잠금 해제)할 수 있는지 본다.
 * @param {AccountActor} actor - 요청한 사람
 * @param {AccountRole} targetRole - 대상 계정 권한
 * @returns {RuleError | null} 문제가 없으면 null
 */
export function checkCanManage(
  actor: AccountActor,
  targetRole: AccountRole,
): RuleError | null {
  const denied = checkManager(actor);
  if (denied) return denied;
  if (targetRole === "teacher" && !actor.isAdmin)
    return {
      code: "forbidden",
      message: "선생님 계정은 관리자만 관리할 수 있습니다.",
    };
  return null;
}

/**
 * 계정 직접 추가 입력을 검사한다.
 * @param {CreateAccountInput} input - 입력
 * @returns {RuleError | null} 문제가 없으면 null
 */
export function validateCreateAccount(
  input: CreateAccountInput,
): RuleError | null {
  const invalid = (message: string): RuleError => ({
    code: "invalid_value",
    message,
  });
  if (input.role !== "teacher" && input.role !== "student")
    return invalid("계정 권한이 올바르지 않습니다.");
  if (!input.name.trim()) return invalid("이름을 입력해주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
    return invalid("이메일 형식을 확인해주세요.");
  if (input.phone && !/^01[016789]-?\d{3,4}-?\d{4}$/.test(input.phone.trim()))
    return invalid("휴대폰 번호 형식을 확인해주세요.");
  if (input.role === "student") {
    if (!input.grade.trim()) return invalid("학년을 선택해주세요.");
    if (!input.classId) return invalid("클래스를 배정해주세요.");
  }
  return null;
}

/**
 * 로그인 실패 뒤 남은 시도 횟수를 계산한다.
 * @param {number} failedCount - 지금까지 연속 실패 횟수 (이번 실패 포함)
 * @param {boolean} isAdmin - 관리자면 잠그지 않는다 (null)
 * @returns {number | null} 남은 횟수 (0이면 잠김), 관리자는 null
 */
export function remainingAttempts(failedCount: number, isAdmin: boolean) {
  if (isAdmin) return null;
  return Math.max(MAX_LOGIN_FAILURES - failedCount, 0);
}
