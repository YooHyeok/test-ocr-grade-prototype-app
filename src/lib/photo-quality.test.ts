import { describe, expect, it } from "vitest";
import {
  analysisSize,
  analyzePixels,
  judgePhotoQuality,
  laplacianVariance,
  measurePixels,
  toLuminance,
  type PixelImage,
} from "./photo-quality";

/**
 * 밝기 함수로 회색조 테스트 이미지를 만든다.
 * @param {number} width - 가로
 * @param {number} height - 세로
 * @param {(x: number, y: number) => number} shade - 좌표별 밝기 0~255
 * @returns {PixelImage}
 */
function makeImage(
  width: number,
  height: number,
  shade: (x: number, y: number) => number,
): PixelImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      const value = shade(x, y);
      data[offset] = data[offset + 1] = data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  return { width, height, data };
}

/** 흰 종이에 검은 글씨 줄이 있는 선명한 시험지 */
const sharpPaper = (x: number, y: number) =>
  y % 12 < 2 && x % 9 < 6 ? 30 : 225;

/**
 * 이미지를 가로세로 상자 평균으로 흐리게 한다. (흔들림 흉내)
 * @param {PixelImage} image - 원본
 * @param {number} radius - 흐림 반경
 * @returns {PixelImage}
 */
function blur(image: PixelImage, radius: number): PixelImage {
  const lum = toLuminance(image);
  return makeImage(image.width, image.height, (x, y) => {
    let sum = 0;
    let count = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = Math.min(image.width - 1, Math.max(0, x + dx));
        const ny = Math.min(image.height - 1, Math.max(0, y + dy));
        sum += lum[ny * image.width + nx];
        count++;
      }
    }
    return sum / count;
  });
}

const FULL_SIZE = { width: 3000, height: 4000 };

describe("품질 지표", () => {
  it("밝기는 RGB 가중 평균, 단색이면 대비·선명도 0", () => {
    const metrics = measurePixels(
      makeImage(20, 20, () => 128),
      FULL_SIZE,
    );
    expect(metrics.brightness).toBeCloseTo(128, 0);
    expect(metrics.contrast).toBeCloseTo(0, 5);
    expect(metrics.sharpness).toBeCloseTo(0, 5);
    expect(metrics.glareRatio).toBe(0);
  });

  it("흐리게 하면 라플라시안 분산(선명도)이 크게 떨어진다", () => {
    const sharp = makeImage(120, 120, sharpPaper);
    const sharpness = laplacianVariance(toLuminance(sharp), 120, 120);
    const blurred = blur(sharp, 3);
    expect(laplacianVariance(toLuminance(blurred), 120, 120)).toBeLessThan(
      sharpness / 10,
    );
  });

  it("분석용 크기는 긴 변 800px 이하로 비율 유지", () => {
    expect(analysisSize(3000, 4000)).toEqual({ width: 600, height: 800 });
    expect(analysisSize(640, 480)).toEqual({ width: 640, height: 480 });
  });
});

describe("품질 판정", () => {
  it("선명하고 밝기가 적당한 시험지는 통과", () => {
    const quality = analyzePixels(makeImage(120, 120, sharpPaper), FULL_SIZE);
    expect(quality.ok).toBe(true);
    expect(quality.issues).toEqual([]);
  });

  it("흔들린 사진은 업로드를 막는다", () => {
    const quality = analyzePixels(
      blur(makeImage(120, 120, sharpPaper), 4),
      FULL_SIZE,
    );
    expect(quality.ok).toBe(false);
    expect(quality.issues.map((issue) => issue.code)).toContain("blurry");
  });

  it("너무 어두우면 막고, 대비 경고는 따로 내지 않는다", () => {
    const quality = analyzePixels(
      makeImage(120, 120, (x, y) => (sharpPaper(x, y) === 30 ? 5 : 40)),
      FULL_SIZE,
    );
    expect(
      quality.issues.map((issue) => [issue.code, issue.level]),
    ).toContainEqual(["too_dark", "error"]);
    expect(quality.issues.some((issue) => issue.code === "low_contrast")).toBe(
      false,
    );
  });

  it("빛 반사는 2% 이상 경고, 4% 이상 오류", () => {
    const base = {
      width: 3000,
      height: 4000,
      brightness: 200,
      contrast: 60,
      sharpness: 300,
    };
    expect(judgePhotoQuality({ ...base, glareRatio: 0.01 }).issues).toEqual([]);
    expect(judgePhotoQuality({ ...base, glareRatio: 0.03 })).toMatchObject({
      ok: true,
      issues: [{ code: "glare", level: "warning" }],
    });
    expect(judgePhotoQuality({ ...base, glareRatio: 0.05 })).toMatchObject({
      ok: false,
      issues: [{ code: "glare", level: "error" }],
    });
  });

  it("해상도가 낮으면 경고만 (업로드는 가능)", () => {
    const quality = analyzePixels(makeImage(120, 120, sharpPaper), {
      width: 640,
      height: 480,
    });
    expect(quality).toMatchObject({
      ok: true,
      issues: [{ code: "low_resolution", level: "warning" }],
    });
  });
});
