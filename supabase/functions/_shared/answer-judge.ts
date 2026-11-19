/**
 * 화학 단답형 답안 판정 엔진 (기획서 §6 판정 규칙).
 * OCR로 읽은 학생 답을 기준 정답·허용 표기와 비교해 정답 / 오답 / 검토 필요로 나눈다.
 *
 * 서버 함수(Deno)와 화면(React, @shared/answer-judge)이 함께 쓰므로 외부 의존성 없이 순수 함수로만 작성한다.
 *
 * 판정 순서
 *   1. 정규화: 유니코드 호환 문자(NFKC: H₂O→H2O, Na⁺→Na+), 공백·구두점 제거, 화살표·빼기표 통일, 이온 전하 위치 통일
 *   2. 정답·허용 표기와 같으면 정답 (반응식은 계수와 물질을 나눠 순서와 관계없이 비교)
 *   3. 같지 않으면: 계수만 다른 반응식은 오답, 대소문자만 다르거나(원소 기호) 한 글자 차이면 검토 필요, 그 외 오답
 *   4. OCR 신뢰도가 기준보다 낮으면 결과와 관계없이 검토 필요 (자동 확정하지 않음)
 *   5. 읽은 글자가 없으면 검토 필요 (빈칸인지 인식 실패인지 선생님이 확인)
 */

/** 판정 결과 */
export type JudgeVerdict = "correct" | "incorrect" | "review";

/** 판정 이유 */
export type JudgeReason =
  | "exact" // 그대로 일치
  | "normalized" // 정규화 후 일치 (공백·아래첨자·전하 표기 등)
  | "alias" // 허용 표기와 일치
  | "equation" // 반응식 계수·물질 일치 (순서 무관)
  | "coefficient" // 반응식 물질은 맞고 계수가 다름
  | "case_mismatch" // 대소문자만 다름 (원소 기호 확인 필요)
  | "near_miss" // 한 글자 차이 (OCR 오인식 가능성)
  | "low_confidence" // OCR 신뢰도 부족
  | "empty" // 읽은 글자 없음
  | "mismatch"; // 다름

/** 판정 이유 표시명 */
export const JUDGE_REASON_LABEL: Record<JudgeReason, string> = {
  exact: "정답과 일치",
  normalized: "표기 차이만 있음 (공백·아래첨자·전하)",
  alias: "허용 표기와 일치",
  equation: "반응식 일치 (순서 무관)",
  coefficient: "반응식 계수가 다름",
  case_mismatch: "대소문자가 다름 (원소 기호 확인)",
  near_miss: "한 글자 차이 (오인식 가능성)",
  low_confidence: "OCR 신뢰도 낮음",
  empty: "읽은 답 없음",
  mismatch: "정답과 다름",
};

/** 판정 결과 표시명 */
export const JUDGE_VERDICT_LABEL: Record<JudgeVerdict, string> = {
  correct: "정답",
  incorrect: "오답",
  review: "검토 필요",
};

/** 자동 확정에 필요한 기본 OCR 신뢰도 */
export const DEFAULT_MIN_CONFIDENCE = 0.8;

export type JudgeInput = {
  /** OCR로 읽은 학생 답 */
  ocrText: string;
  /** 기준 정답 */
  answer: string;
  /** 허용 표기 (예: 염화 나트륨, 염화나트륨) */
  aliases?: string[];
  /** OCR 신뢰도 0~1 (없으면 검사하지 않음) */
  confidence?: number | null;
  /** 자동 확정 기준 신뢰도 */
  minConfidence?: number;
};

export type JudgeResult = {
  verdict: JudgeVerdict;
  reason: JudgeReason;
  /** 정규화한 학생 답 */
  normalized: string;
  /** 일치하거나 가장 가까운 기준 답 (원래 표기) */
  matched: string | null;
};

const ARROW = "→";
const ARROW_PATTERN = /(?:-+>|=+>|⟶|⇒|➝|➞|→)/g;
const DASH_PATTERN = /[−–—‐‑]/g;
// 반응식·이온에 쓰는 + - → = ( ) [ ] 는 남기고 문장 부호만 지운다.
const PUNCTUATION_PATTERN = /[.,·。、!?'"“”‘’`~;:^]/g;

/**
 * 답안을 비교하기 좋게 정규화한다.
 * - NFKC: 아래첨자·위첨자·전각 문자를 일반 문자로 (H₂O→H2O, SO₄²⁻→SO42-)
 * - 공백 제거 (한글 띄어쓰기 차이 허용), 문장 부호 제거
 * - 화살표(->, =>, ⟶)를 →로, 여러 빼기표(−, –)를 -로
 * - 이온 전하 위치 통일: Fe+3 → Fe3+, Na1+ → Na+ (반응식이 아닐 때)
 * @param {string} text - 원래 답
 * @returns {string} 정규화한 답
 */
export function normalizeAnswer(text: string) {
  let value = text
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(ARROW_PATTERN, ARROW)
    .replace(DASH_PATTERN, "-")
    .replace(PUNCTUATION_PATTERN, "");
  if (!value.includes(ARROW)) {
    value = value
      .replace(/([A-Za-z)\]])([+-])(\d+)$/, "$1$3$2")
      .replace(/([A-Za-z)\]])1([+-])$/, "$1$2");
  }
  return value;
}

/**
 * 반응식 한쪽을 "계수|물질" 목록으로 나눈다. 이온 전하의 +와 항을 잇는 +를 구분한다.
 * @param {string} side - 예: 2H2+O2
 * @returns {{ coefficient: number, species: string }[]}
 */
function parseSide(side: string) {
  return side
    .split(/\+(?=[0-9A-Za-z([가-힣])/)
    .filter(Boolean)
    .map((term) => {
      const match = /^(\d+)(\D.*)$/.exec(term);
      return match
        ? { coefficient: Number(match[1]), species: match[2] }
        : { coefficient: 1, species: term };
    });
}

/**
 * 반응식 두 개를 비교한다. 같은 쪽 항의 순서는 따지지 않는다.
 * @param {string} a - 정규화한 반응식
 * @param {string} b - 정규화한 반응식
 * @returns {"same" | "coefficient" | "different"}
 */
function compareEquations(a: string, b: string) {
  const sidesA = a.split(ARROW);
  const sidesB = b.split(ARROW);
  if (sidesA.length !== 2 || sidesB.length !== 2) return "different";
  const key = (side: string, withCoefficient: boolean) =>
    parseSide(side)
      .map((term) =>
        withCoefficient ? `${term.coefficient}*${term.species}` : term.species,
      )
      .sort()
      .join("+");
  const same = (withCoefficient: boolean) =>
    sidesA.every(
      (side, index) =>
        key(side, withCoefficient) === key(sidesB[index], withCoefficient),
    );
  if (same(true)) return "same";
  if (same(false)) return "coefficient";
  return "different";
}

/**
 * 두 문자열의 편집 거리(레벤슈타인)를 구한다.
 * @param {string} a - 문자열
 * @param {string} b - 문자열
 * @returns {number}
 */
export function editDistance(a: string, b: string) {
  const left = [...a];
  const right = [...b];
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    const current = [i];
    for (let j = 1; j <= right.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

/**
 * 허용 표기 입력("산화 반응, 산화반응")을 목록으로 나눈다.
 * @param {string} text - 쉼표로 구분한 허용 표기
 * @returns {string[]}
 */
export function parseAliases(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** 비교 대상 (정답·허용 표기의 원래 표기와 정규화 값) */
type Expected = { text: string; normalized: string };

/**
 * 학생 답과 일치하는 기준 답을 찾는다.
 * @param {Expected[]} expected - 정답(0번)과 허용 표기
 * @param {string} normalized - 정규화한 학생 답
 * @param {string} ocrText - 원래 학생 답
 * @returns {{ item: Expected, reason: JudgeReason } | null}
 */
function findMatch(expected: Expected[], normalized: string, ocrText: string) {
  for (const [index, item] of expected.entries()) {
    if (item.normalized === normalized) {
      if (index > 0) return { item, reason: "alias" as const };
      const reason =
        ocrText.trim() === item.text.trim() ? "exact" : "normalized";
      return { item, reason: reason as JudgeReason };
    }
    if (
      normalized.includes(ARROW) &&
      item.normalized.includes(ARROW) &&
      compareEquations(item.normalized, normalized) === "same"
    ) {
      return { item, reason: "equation" as const };
    }
  }
  return null;
}

/**
 * 일치하지 않는 학생 답의 가장 가까운 이유를 찾는다. 없으면 null(그냥 다름).
 * - 반응식 계수만 다름 → 오답 / 대소문자만 다름·한 글자 차이 → 검토 필요
 * @param {Expected[]} expected - 정답과 허용 표기
 * @param {string} normalized - 정규화한 학생 답
 * @returns {{ item: Expected, verdict: JudgeVerdict, reason: JudgeReason } | null}
 */
function explainMismatch(expected: Expected[], normalized: string) {
  const coefficient = expected.find(
    (item) =>
      normalized.includes(ARROW) &&
      item.normalized.includes(ARROW) &&
      compareEquations(item.normalized, normalized) === "coefficient",
  );
  if (coefficient)
    return {
      item: coefficient,
      verdict: "incorrect" as const,
      reason: "coefficient" as const,
    };
  const caseOnly = expected.find(
    (item) =>
      /[A-Za-z]/.test(item.normalized) &&
      item.normalized.toLowerCase() === normalized.toLowerCase(),
  );
  if (caseOnly)
    return {
      item: caseOnly,
      verdict: "review" as const,
      reason: "case_mismatch" as const,
    };
  const nearMiss = expected.find(
    (item) =>
      [...item.normalized].length >= 2 &&
      editDistance(item.normalized, normalized) === 1,
  );
  if (nearMiss)
    return {
      item: nearMiss,
      verdict: "review" as const,
      reason: "near_miss" as const,
    };
  return null;
}

/**
 * 학생 답 하나를 판정한다.
 * @param {JudgeInput} input - 학생 답, 기준 정답, 허용 표기, OCR 신뢰도
 * @returns {JudgeResult}
 */
export function judgeAnswer(input: JudgeInput): JudgeResult {
  const normalized = normalizeAnswer(input.ocrText);
  const minConfidence = input.minConfidence ?? DEFAULT_MIN_CONFIDENCE;
  const lowConfidence =
    typeof input.confidence === "number" && input.confidence < minConfidence;
  const expected = [input.answer, ...(input.aliases ?? [])]
    .map((text) => ({ text, normalized: normalizeAnswer(text) }))
    .filter((item) => item.normalized);
  const result = (
    verdict: JudgeVerdict,
    reason: JudgeReason,
    matched: string | null,
  ): JudgeResult => ({ verdict, reason, normalized, matched });

  if (!normalized) return result("review", "empty", null);

  const match = findMatch(expected, normalized, input.ocrText);
  if (match) {
    return lowConfidence
      ? result("review", "low_confidence", match.item.text)
      : result("correct", match.reason, match.item.text);
  }

  const mismatch = explainMismatch(expected, normalized);
  // 신뢰도가 낮으면 오답도 자동 확정하지 않는다. (검토 필요 이유는 그대로 둔다)
  if (lowConfidence && mismatch?.verdict !== "review")
    return result("review", "low_confidence", mismatch?.item.text ?? null);
  if (mismatch)
    return result(mismatch.verdict, mismatch.reason, mismatch.item.text);
  return result("incorrect", "mismatch", null);
}

export type JudgeSummary = {
  total: number;
  correct: number;
  incorrect: number;
  review: number;
  /** 100점 만점 점수 (검토 필요는 아직 정답으로 세지 않음) */
  score: number;
  /** 검토 필요가 없어 바로 확정할 수 있는지 */
  confirmable: boolean;
};

/**
 * 시험지 한 장의 판정 결과를 요약한다.
 * @param {JudgeResult[]} results - 문항별 판정 결과
 * @returns {JudgeSummary}
 */
export function summarizeJudgements(results: JudgeResult[]): JudgeSummary {
  const count = (verdict: JudgeVerdict) =>
    results.filter((item) => item.verdict === verdict).length;
  const correct = count("correct");
  const review = count("review");
  return {
    total: results.length,
    correct,
    incorrect: count("incorrect"),
    review,
    score: results.length ? Math.round((correct / results.length) * 100) : 0,
    confirmable: review === 0,
  };
}
