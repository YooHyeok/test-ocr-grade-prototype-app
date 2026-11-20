/**
 * 시험지 사진 촬영 품질 검사 (기획서 §12).
 * 업로드 전에 브라우저에서 밝기·대비·선명도(흔들림)·빛 반사·해상도를 계산해 재촬영이 필요한지 판단한다.
 *
 * 픽셀 계산(analyzePixels)은 순수 함수라 Vitest로 검사하고,
 * 파일·카메라 화면을 픽셀로 바꾸는 부분(analyzePhotoFile, analyzeVideoFrame)만 브라우저 API를 쓴다.
 * 기준값은 분석용으로 줄인 이미지(긴 변 ANALYSIS_MAX_SIDE) 기준이며, 실제 촬영본으로 보정할 수 있게 상수로 둔다.
 */

/** RGBA 픽셀 (ImageData와 같은 모양) */
export type PixelImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type PhotoMetrics = {
  /** 원본 크기 */
  width: number;
  height: number;
  /** 평균 밝기 0~255 */
  brightness: number;
  /** 밝기 표준편차 (대비) */
  contrast: number;
  /** 라플라시안 분산 (클수록 선명) */
  sharpness: number;
  /** 하얗게 날아간 픽셀 비율 0~1 (빛 반사) */
  glareRatio: number;
};

export type PhotoIssueCode =
  | "too_dark"
  | "too_bright"
  | "blurry"
  | "glare"
  | "low_contrast"
  | "low_resolution";

export type PhotoIssue = {
  code: PhotoIssueCode;
  /** error: 업로드 막음 / warning: 안내만 */
  level: "error" | "warning";
  message: string;
};

export type PhotoQuality = {
  metrics: PhotoMetrics;
  issues: PhotoIssue[];
  /** 막는 문제(error)가 없으면 true */
  ok: boolean;
};

/** 분석할 때 줄이는 긴 변 길이 (px) */
export const ANALYSIS_MAX_SIDE = 800;

/** 판정 기준 (분석용 축소 이미지 기준) */
export const PHOTO_THRESHOLDS = {
  minBrightness: 70,
  maxBrightness: 235,
  minContrast: 25,
  /** 이보다 작으면 흔들림 */
  minSharpness: 100,
  /** 하얗게 날아간 픽셀로 보는 밝기 */
  glareLevel: 250,
  /** 이 비율 이상이면 반사 경고, 두 배 이상이면 오류 */
  glareWarnRatio: 0.02,
  /** 원본 짧은 변이 이보다 작으면 해상도 경고 */
  minShortSide: 1000,
} as const;

const ISSUE_MESSAGE: Record<PhotoIssueCode, string> = {
  too_dark: "사진이 너무 어둡습니다. 밝은 곳에서 다시 찍어주세요.",
  too_bright: "사진이 너무 밝습니다. 조명을 피하거나 노출을 낮춰주세요.",
  blurry: "사진이 흔들렸습니다. 휴대폰을 고정하고 다시 찍어주세요.",
  glare: "빛 반사가 있습니다. 조명이 비치지 않게 각도를 바꿔주세요.",
  low_contrast:
    "글씨와 종이의 구분이 약합니다. 진한 펜이나 밝은 곳을 권장합니다.",
  low_resolution: "해상도가 낮습니다. 시험지를 화면에 가득 차게 찍어주세요.",
};

/**
 * RGBA 픽셀을 밝기(0~255) 배열로 바꾼다.
 * @param {PixelImage} image - RGBA 픽셀
 * @returns {Float32Array}
 */
export function toLuminance(image: PixelImage) {
  const { data } = image;
  const luminance = new Float32Array(image.width * image.height);
  for (let i = 0; i < luminance.length; i++) {
    const offset = i * 4;
    luminance[i] =
      0.299 * data[offset] +
      0.587 * data[offset + 1] +
      0.114 * data[offset + 2];
  }
  return luminance;
}

/**
 * 라플라시안 분산(선명도)을 구한다. 가장자리 한 줄은 제외한다.
 * @param {Float32Array} luminance - 밝기 배열
 * @param {number} width - 가로 픽셀 수
 * @param {number} height - 세로 픽셀 수
 * @returns {number}
 */
export function laplacianVariance(
  luminance: Float32Array,
  width: number,
  height: number,
) {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const value =
        luminance[i - width] +
        luminance[i + width] +
        luminance[i - 1] +
        luminance[i + 1] -
        4 * luminance[i];
      sum += value;
      sumSquares += value * value;
      count++;
    }
  }
  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

/**
 * 픽셀로 품질 지표를 계산한다.
 * @param {PixelImage} image - 분석용 RGBA 픽셀
 * @param {{ width: number, height: number }} [original] - 원본 크기 (해상도 판정용, 없으면 image 크기)
 * @returns {PhotoMetrics}
 */
export function measurePixels(
  image: PixelImage,
  original: { width: number; height: number } = image,
): PhotoMetrics {
  const luminance = toLuminance(image);
  let sum = 0;
  let sumSquares = 0;
  let glare = 0;
  for (const value of luminance) {
    sum += value;
    sumSquares += value * value;
    if (value >= PHOTO_THRESHOLDS.glareLevel) glare++;
  }
  const count = luminance.length || 1;
  const brightness = sum / count;
  return {
    width: original.width,
    height: original.height,
    brightness,
    contrast: Math.sqrt(
      Math.max(0, sumSquares / count - brightness * brightness),
    ),
    sharpness: laplacianVariance(luminance, image.width, image.height),
    glareRatio: glare / count,
  };
}

/**
 * 품질 지표로 문제를 판정한다.
 * @param {PhotoMetrics} metrics - 품질 지표
 * @param {typeof PHOTO_THRESHOLDS} [thresholds] - 판정 기준
 * @returns {PhotoQuality}
 */
export function judgePhotoQuality(
  metrics: PhotoMetrics,
  thresholds: typeof PHOTO_THRESHOLDS = PHOTO_THRESHOLDS,
): PhotoQuality {
  const issues: PhotoIssue[] = [];
  const add = (code: PhotoIssueCode, level: PhotoIssue["level"]) =>
    issues.push({ code, level, message: ISSUE_MESSAGE[code] });

  if (metrics.brightness < thresholds.minBrightness) add("too_dark", "error");
  else if (metrics.brightness > thresholds.maxBrightness)
    add("too_bright", "error");
  if (metrics.sharpness < thresholds.minSharpness) add("blurry", "error");
  if (metrics.glareRatio >= thresholds.glareWarnRatio * 2)
    add("glare", "error");
  else if (metrics.glareRatio >= thresholds.glareWarnRatio)
    add("glare", "warning");
  // 너무 어둡거나 밝으면 대비가 낮은 건 당연하므로 따로 알리지 않는다.
  if (
    metrics.contrast < thresholds.minContrast &&
    !issues.some(
      (issue) => issue.code === "too_dark" || issue.code === "too_bright",
    )
  )
    add("low_contrast", "warning");
  if (Math.min(metrics.width, metrics.height) < thresholds.minShortSide)
    add("low_resolution", "warning");

  return {
    metrics,
    issues,
    ok: issues.every((issue) => issue.level !== "error"),
  };
}

/**
 * 픽셀로 품질을 검사한다. (지표 계산 + 판정)
 * @param {PixelImage} image - 분석용 RGBA 픽셀
 * @param {{ width: number, height: number }} [original] - 원본 크기
 * @returns {PhotoQuality}
 */
export function analyzePixels(
  image: PixelImage,
  original?: { width: number; height: number },
) {
  return judgePhotoQuality(measurePixels(image, original));
}

/**
 * 원본 크기를 분석용 크기(긴 변 ANALYSIS_MAX_SIDE 이하)로 줄인 크기를 구한다.
 * @param {number} width - 원본 가로
 * @param {number} height - 원본 세로
 * @returns {{ width: number, height: number }}
 */
export function analysisSize(width: number, height: number) {
  const scale = Math.min(1, ANALYSIS_MAX_SIDE / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * 이미지·영상 화면을 분석용 크기로 그려 픽셀을 꺼낸다. (브라우저 전용)
 * @param {CanvasImageSource} source - 이미지·영상
 * @param {number} width - 원본 가로
 * @param {number} height - 원본 세로
 * @returns {PixelImage}
 */
function readPixels(
  source: CanvasImageSource,
  width: number,
  height: number,
): PixelImage {
  const size = analysisSize(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("이미지를 분석할 수 없는 브라우저입니다.");
  context.drawImage(source, 0, 0, size.width, size.height);
  return context.getImageData(0, 0, size.width, size.height);
}

/**
 * 사진 파일의 품질을 검사한다. (브라우저 전용)
 * 브라우저가 읽지 못하는 형식(예: 일부 HEIC)이면 오류를 던진다.
 * @param {Blob} file - 사진 파일
 * @returns {Promise<PhotoQuality>}
 */
export async function analyzePhotoFile(file: Blob): Promise<PhotoQuality> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("사진을 읽을 수 없습니다. JPG 또는 PNG로 올려주세요.");
  }
  try {
    return analyzePixels(readPixels(bitmap, bitmap.width, bitmap.height), {
      width: bitmap.width,
      height: bitmap.height,
    });
  } finally {
    bitmap.close();
  }
}

/**
 * 카메라 영상의 현재 화면 품질을 검사한다. (브라우저 전용)
 * @param {HTMLVideoElement} video - 재생 중인 카메라 영상
 * @returns {PhotoQuality | null} 아직 화면이 없으면 null
 */
export function analyzeVideoFrame(
  video: HTMLVideoElement,
): PhotoQuality | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  return analyzePixels(readPixels(video, video.videoWidth, video.videoHeight), {
    width: video.videoWidth,
    height: video.videoHeight,
  });
}
