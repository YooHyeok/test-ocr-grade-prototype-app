import { describe, expect, it } from "vitest";
import {
  checkCanManage,
  generateTempPassword,
  remainingAttempts,
  validateCreateAccount,
  type AccountActor,
  type CreateAccountInput,
} from "./account-rules";

const ADMIN: AccountActor = {
  role: "teacher",
  isAdmin: true,
  academyId: "a",
  locked: false,
};
const TEACHER: AccountActor = { ...ADMIN, isAdmin: false };
const STUDENT: AccountActor = { ...ADMIN, role: "student", isAdmin: false };

const INPUT: CreateAccountInput = {
  role: "student",
  name: "홍길동",
  email: "gildong@student.kr",
  grade: "고1",
  classId: "c1",
  phone: null,
};

describe("임시 비밀번호", () => {
  it("12자이고 영문·숫자를 섞으며, 헷갈리는 글자를 쓰지 않는다", () => {
    for (let seed = 0; seed < 50; seed++) {
      let state = seed;
      const randomInt = (max: number) => {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state % max;
      };
      const password = generateTempPassword(randomInt);
      expect(password).toHaveLength(12);
      expect(password).toMatch(/[A-Za-z]/);
      expect(password).toMatch(/\d/);
      expect(password).not.toMatch(/[0O1lI]/);
    }
  });
});

describe("계정 관리 권한", () => {
  it("관리자는 선생님·학생, 선생님은 학생만", () => {
    expect(checkCanManage(ADMIN, "teacher")).toBeNull();
    expect(checkCanManage(ADMIN, "student")).toBeNull();
    expect(checkCanManage(TEACHER, "student")).toBeNull();
    expect(checkCanManage(TEACHER, "teacher")?.code).toBe("forbidden");
  });

  it("학생·잠긴 계정·학원 없는 계정은 관리할 수 없다", () => {
    expect(checkCanManage(STUDENT, "student")?.code).toBe("forbidden");
    expect(checkCanManage({ ...ADMIN, locked: true }, "student")?.code).toBe(
      "forbidden",
    );
    expect(checkCanManage({ ...ADMIN, academyId: null }, "student")?.code).toBe(
      "forbidden",
    );
  });
});

describe("계정 추가 입력 검사", () => {
  it("문제가 없으면 null", () => {
    expect(validateCreateAccount(INPUT)).toBeNull();
    expect(
      validateCreateAccount({
        ...INPUT,
        role: "teacher",
        grade: "",
        classId: null,
        phone: "010-1234-5678",
      }),
    ).toBeNull();
  });

  it("이름·이메일·휴대폰 형식, 학생은 학년·클래스 필수", () => {
    expect(validateCreateAccount({ ...INPUT, name: " " })?.message).toContain(
      "이름",
    );
    expect(validateCreateAccount({ ...INPUT, email: "x" })?.message).toContain(
      "이메일",
    );
    expect(
      validateCreateAccount({ ...INPUT, phone: "02-1" })?.message,
    ).toContain("휴대폰");
    expect(validateCreateAccount({ ...INPUT, grade: "" })?.message).toContain(
      "학년",
    );
    expect(
      validateCreateAccount({ ...INPUT, classId: null })?.message,
    ).toContain("클래스");
  });
});

describe("로그인 남은 시도 횟수", () => {
  it("5회째 실패하면 0 (잠김), 관리자는 null", () => {
    expect(remainingAttempts(1, false)).toBe(4);
    expect(remainingAttempts(5, false)).toBe(0);
    expect(remainingAttempts(7, false)).toBe(0);
    expect(remainingAttempts(9, true)).toBeNull();
  });
});
