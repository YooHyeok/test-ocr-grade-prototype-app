import { describe, expect, it } from "vitest";
import {
  defaultNotifyPrefs,
  findAcademy,
  formatPhone,
  formatStamp,
  isPhone,
  isStrongPassword,
  maskPhone,
  suggestClass,
  validateNotifyPrefs,
  validateSignupInfo,
  type SignupInfo,
} from "./account";

const INFO: SignupInfo = {
  type: "student",
  academy: "라온 과학학원",
  name: "홍길동",
  grade: "고1",
  email: "gildong@student.kr",
  password: "abcd1234",
  passwordConfirm: "abcd1234",
  agreed: true,
};

describe("휴대폰 번호", () => {
  it("하이픈 유무와 관계없이 형식을 확인한다", () => {
    expect(isPhone("01012345678")).toBe(true);
    expect(isPhone("010-1234-5678")).toBe(true);
    expect(isPhone("011-123-4567")).toBe(true);
    expect(isPhone("02-123-4567")).toBe(false);
    expect(isPhone("0101234")).toBe(false);
  });

  it("010-0000-0000 형태로 바꾸고 가운데를 가린다", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
    expect(formatPhone("011 123 4567")).toBe("011-123-4567");
    expect(maskPhone("01012345678")).toBe("010-****-5678");
  });
});

describe("회원가입 입력 검사", () => {
  it("문제가 없으면 null", () => {
    expect(validateSignupInfo(INFO, [])).toBeNull();
  });

  it("위에서부터 첫 번째 문제를 알려준다", () => {
    expect(
      validateSignupInfo({ ...INFO, academy: null, name: "" }, []),
    ).toContain("학원 코드");
    expect(validateSignupInfo({ ...INFO, grade: "" }, [])).toContain("학년");
    expect(validateSignupInfo({ ...INFO, email: "abc" }, [])).toContain(
      "이메일",
    );
    expect(
      validateSignupInfo(
        { ...INFO, password: "abcdefgh", passwordConfirm: "abcdefgh" },
        [],
      ),
    ).toContain("영문과 숫자");
    expect(
      validateSignupInfo({ ...INFO, passwordConfirm: "abcd12345" }, []),
    ).toContain("일치하지");
    expect(validateSignupInfo({ ...INFO, agreed: false }, [])).toContain(
      "약관",
    );
  });

  it("선생님은 학년이 없어도 되고, 이미 신청한 이메일은 막는다", () => {
    expect(
      validateSignupInfo({ ...INFO, type: "teacher", grade: "" }, []),
    ).toBeNull();
    expect(
      validateSignupInfo({ ...INFO, email: "GilDong@student.kr" }, [
        "gildong@student.kr",
      ]),
    ).toContain("이미");
  });

  it("비밀번호는 8자 이상, 영문·숫자 포함", () => {
    expect(isStrongPassword("abc12345")).toBe(true);
    expect(isStrongPassword("abc1234")).toBe(false);
    expect(isStrongPassword("12345678")).toBe(false);
  });
});

describe("학원 코드·클래스", () => {
  it("학원 코드는 대소문자를 무시한다", () => {
    expect(findAcademy(" raon ")).toBe("라온 과학학원");
    expect(findAcademy("NOPE")).toBeNull();
  });

  it("학년에 맞는 클래스를 고른다", () => {
    expect(suggestClass("고2")).toBe("고2 화학 I");
    expect(suggestClass("중1")).toBe("");
  });
});

describe("알림 설정 검사", () => {
  const prefs = defaultNotifyPrefs("me@student.kr");

  it("기본은 계정 이메일로 이메일 알림만", () => {
    expect(prefs.methods).toEqual(["email"]);
    expect(validateNotifyPrefs(prefs)).toBeNull();
  });

  it("고른 방법에 필요한 정보가 없으면 막는다", () => {
    expect(validateNotifyPrefs({ ...prefs, email: "x" })).toContain("이메일");
    expect(validateNotifyPrefs({ ...prefs, methods: ["push"] })).toContain(
      "알림을 허용",
    );
    expect(
      validateNotifyPrefs({ ...prefs, methods: ["push"], pushAllowed: true }),
    ).toBeNull();
    expect(
      validateNotifyPrefs({
        ...prefs,
        methods: ["kakao"],
        kakao: { useVerified: false, phone: "010" },
      }),
    ).toContain("휴대폰");
    expect(
      validateNotifyPrefs({
        ...prefs,
        methods: ["sms"],
        sms: { useVerified: false, phone: "010-7777-8888" },
      }),
    ).toBeNull();
  });

  it("고르지 않은 방법의 입력은 검사하지 않는다", () => {
    expect(
      validateNotifyPrefs({ ...prefs, methods: [], email: "" }),
    ).toBeNull();
  });
});

describe("시각 표시", () => {
  it("YYYY-MM-DD HH:MM", () => {
    expect(formatStamp(new Date(2026, 10, 2, 9, 5))).toBe("2026-11-02 09:05");
  });
});
