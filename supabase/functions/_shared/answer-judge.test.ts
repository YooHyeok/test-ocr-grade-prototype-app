import { describe, expect, it } from "vitest";
import {
  editDistance,
  judgeAnswer,
  normalizeAnswer,
  parseAliases,
  summarizeJudgements,
} from "./answer-judge.ts";

describe("답안 정규화", () => {
  it.each([
    ["H₂O", "H2O"],
    ["Na⁺", "Na+"],
    ["SO₄²⁻", "SO42-"],
    ["SO4 2-", "SO42-"],
    ["SO4^2-", "SO42-"],
    ["Fe+3", "Fe3+"],
    ["Na1+", "Na+"],
    ["Cl−", "Cl-"],
    ["염화 나트륨.", "염화나트륨"],
    ["  산화  반응 ", "산화반응"],
    ["ＮａＣｌ", "NaCl"],
    ["2H2 + O2 -> 2H2O", "2H2+O2→2H2O"],
    ["CH4 + 2O2 => CO2 + 2H2O", "CH4+2O2→CO2+2H2O"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });

  it("허용 표기는 쉼표로 나눈다", () => {
    expect(parseAliases(" 산화 반응, 산화반응 ,, ")).toEqual([
      "산화 반응",
      "산화반응",
    ]);
  });

  it("편집 거리 (한글 한 글자 = 1)", () => {
    expect(editDistance("산화", "산회")).toBe(1);
    expect(editDistance("NaCl", "NaCl")).toBe(0);
    expect(editDistance("", "abc")).toBe(3);
  });
});

describe("답안 판정", () => {
  const judge = (ocrText: string, answer: string, extra: object = {}) =>
    judgeAnswer({ ocrText, answer, ...extra });

  it("그대로 같으면 정답(exact), 표기만 다르면 정답(normalized)", () => {
    expect(judge("산화", "산화")).toMatchObject({
      verdict: "correct",
      reason: "exact",
    });
    expect(judge("H₂O", "H2O")).toMatchObject({
      verdict: "correct",
      reason: "normalized",
    });
    expect(judge("산화 수", "산화수")).toMatchObject({
      verdict: "correct",
      reason: "normalized",
    });
    expect(judge("SO4 2-", "SO₄²⁻")).toMatchObject({ verdict: "correct" });
  });

  it("허용 표기와 같으면 정답(alias)", () => {
    expect(
      judge("염화나트륨", "NaCl", { aliases: ["염화 나트륨"] }),
    ).toMatchObject({
      verdict: "correct",
      reason: "alias",
      matched: "염화 나트륨",
    });
  });

  it("반응식은 같은 쪽 항의 순서와 관계없이 비교한다", () => {
    expect(judge("O2 + 2H2 → 2H2O", "2H2 + O2 → 2H2O")).toMatchObject({
      verdict: "correct",
      reason: "equation",
    });
  });

  it("반응식 물질은 맞고 계수만 다르면 오답(coefficient)", () => {
    expect(judge("H2 + O2 → H2O", "2H2 + O2 → 2H2O")).toMatchObject({
      verdict: "incorrect",
      reason: "coefficient",
    });
  });

  it("반응식의 이온 전하 +와 항을 잇는 +를 구분한다", () => {
    expect(judge("Cl- + Na+ → NaCl", "Na+ + Cl- → NaCl")).toMatchObject({
      verdict: "correct",
      reason: "equation",
    });
  });

  it("원소 기호 대소문자만 다르면 검토 필요(case_mismatch)", () => {
    expect(judge("nacl", "NaCl")).toMatchObject({
      verdict: "review",
      reason: "case_mismatch",
    });
    // Co(코발트)와 CO(일산화 탄소)는 다른 답이므로 자동으로 정답 처리하지 않는다.
    expect(judge("CO", "Co")).toMatchObject({
      verdict: "review",
      reason: "case_mismatch",
    });
  });

  it("한 글자 차이는 OCR 오인식일 수 있어 검토 필요(near_miss)", () => {
    expect(judge("산회", "산화")).toMatchObject({
      verdict: "review",
      reason: "near_miss",
      matched: "산화",
    });
  });

  it("다르면 오답(mismatch)", () => {
    expect(judge("환원", "산화")).toMatchObject({
      verdict: "incorrect",
      reason: "mismatch",
    });
  });

  it("OCR 신뢰도가 낮으면 맞아도 검토 필요", () => {
    expect(judge("산화", "산화", { confidence: 0.6 })).toMatchObject({
      verdict: "review",
      reason: "low_confidence",
      matched: "산화",
    });
    expect(judge("산화", "산화", { confidence: 0.95 })).toMatchObject({
      verdict: "correct",
    });
    expect(
      judge("산화", "산화", { confidence: 0.7, minConfidence: 0.6 }),
    ).toMatchObject({
      verdict: "correct",
    });
    expect(judge("환원", "산화", { confidence: 0.5 })).toMatchObject({
      verdict: "review",
    });
  });

  it("읽은 글자가 없으면 검토 필요(empty)", () => {
    expect(judge("  . ", "산화")).toMatchObject({
      verdict: "review",
      reason: "empty",
    });
  });
});

describe("시험지 요약", () => {
  it("검토 필요는 아직 정답으로 세지 않고, 하나라도 있으면 바로 확정할 수 없다", () => {
    const results = [
      judgeAnswer({ ocrText: "산화", answer: "산화" }),
      judgeAnswer({ ocrText: "환원", answer: "환원" }),
      judgeAnswer({ ocrText: "산화슈", answer: "산화수" }),
      judgeAnswer({ ocrText: "몰", answer: "산화 환원 반응" }),
    ];
    expect(summarizeJudgements(results)).toEqual({
      total: 4,
      correct: 2,
      incorrect: 1,
      review: 1,
      score: 50,
      confirmable: false,
    });
  });
});
