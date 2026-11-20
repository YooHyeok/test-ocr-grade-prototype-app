import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOBILE_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { analyzeVideoFrame, type PhotoQuality } from "@/lib/photo-quality";
import { cn } from "@/lib/utils";
import type { CheckedPhoto } from "./photo-dropzone";
import PhotoQualityReport from "./photo-quality-report";

type Props = {
  /** 촬영하면 결과를, 다시 찍기를 누르면 null을 넘긴다. */
  onCaptured: (photo: CheckedPhoto | null) => void;
};

type Status = "idle" | "starting" | "live" | "captured" | "error";

/** 카메라 화면 검사 간격 (ms) */
const CHECK_INTERVAL = 500;
/** 연속으로 이만큼 통과하면 자동 촬영 */
const AUTO_CAPTURE_STREAK = 3;

/**
 * 카메라 영상의 현재 화면을 원본 크기 JPG 파일로 만든다.
 * @param {HTMLVideoElement} video - 재생 중인 카메라 영상
 * @returns {Promise<File>}
 */
function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d")?.drawImage(video, 0, 0);
  return new Promise<File>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(
              new File([blob], `시험지-${Date.now()}.jpg`, {
                type: "image/jpeg",
              }),
            )
          : reject(new Error("사진을 만들지 못했습니다.")),
      "image/jpeg",
      0.92,
    ),
  );
}

type Badge = { text: string; tone: "idle" | "pass" | "fail" };

/**
 * 카메라 위 상태 표시 문구와 색을 정한다.
 * @param {Status} status - 카메라 상태
 * @param {PhotoQuality | null} quality - 최근 화면 검사 결과
 * @param {number} streak - 연속 통과 횟수
 * @returns {Badge}
 */
function badgeOf(
  status: Status,
  quality: PhotoQuality | null,
  streak: number,
): Badge {
  if (status === "starting") return { text: "카메라 연결 중", tone: "idle" };
  if (status !== "live") return { text: "카메라를 연결해주세요", tone: "idle" };
  if (!quality) return { text: "시험지 확인 중", tone: "idle" };
  if (!quality.ok) {
    const issue = quality.issues.find((item) => item.level === "error");
    return { text: issue?.message ?? "다시 맞춰주세요", tone: "fail" };
  }
  const count = Math.min(streak, AUTO_CAPTURE_STREAK);
  return {
    text: `인식 성공 · 자동 촬영합니다 (${count}/${AUTO_CAPTURE_STREAK})`,
    tone: "pass",
  };
}

const BADGE_STYLE = {
  idle: {
    box: "bg-[#1b2723]/70 text-[#fff5d2]",
    dot: "bg-[#f5d877]",
    corner: "border-[#f5d877]",
  },
  pass: {
    box: "bg-[#0f5b3f]/90 text-[#dff7e9]",
    dot: "bg-[#75e1a6]",
    corner: "border-[#75e1a6]",
  },
  fail: {
    box: "bg-[#962024]/90 text-[#ffe3e2]",
    dot: "bg-[#ff7b7b]",
    corner: "border-[#ff8a8a]",
  },
} as const;

const CORNERS = [
  "-top-0.5 -left-0.5 border-t-3 border-l-3",
  "-top-0.5 -right-0.5 border-t-3 border-r-3",
  "-right-0.5 -bottom-0.5 border-r-3 border-b-3",
  "-bottom-0.5 -left-0.5 border-b-3 border-l-3",
];

/**
 * 실시간 촬영 영역 (기획서 §12). 모바일에서 후면 카메라를 연결해 0.5초마다 촬영 품질(밝기·흔들림·반사)을 검사하고,
 * 연속 3번 통과하면 자동으로 촬영한다. 촬영하기 버튼으로 직접 찍을 수도 있다. 데스크톱에서는 안내만 보여준다.
 * TODO: 정렬 마커(네 모서리) 검출·원근 보정은 OpenCV 연결 후 추가
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function CameraPanel({ onCaptured }: Readonly<Props>) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const streakRef = useRef(0);
  const capturingRef = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [liveQuality, setLiveQuality] = useState<PhotoQuality | null>(null);
  const [captured, setCaptured] = useState<CheckedPhoto | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // 화면을 떠나면 카메라를 끄고 미리보기 주소를 해제한다.
  useEffect(() => stopCamera, [stopCamera]);
  useEffect(
    () => () => {
      if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    },
    [capturedUrl],
  );

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || capturingRef.current) return;
    capturingRef.current = true;
    try {
      const quality = analyzeVideoFrame(video);
      if (!quality) throw new Error("카메라 화면이 아직 준비되지 않았습니다.");
      const file = await captureFrame(video);
      const photo = { file, quality };
      stopCamera();
      setCaptured(photo);
      setCapturedUrl(URL.createObjectURL(file));
      setStatus("captured");
      onCaptured(photo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "촬영하지 못했습니다.");
    } finally {
      capturingRef.current = false;
    }
  }, [onCaptured, stopCamera]);

  // 카메라가 켜지면(화면에 영상이 그려진 뒤) 스트림을 연결하고, 화면 품질을 검사해 연속 통과하면 자동 촬영한다.
  useEffect(() => {
    if (status !== "live") return undefined;
    const video = videoRef.current;
    if (video && streamRef.current && video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
      void video.play();
    }
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      const quality = analyzeVideoFrame(video);
      setLiveQuality(quality);
      streakRef.current = quality?.ok ? streakRef.current + 1 : 0;
      setStreak(streakRef.current);
      if (streakRef.current >= AUTO_CAPTURE_STREAK) void capture();
    }, CHECK_INTERVAL);
    return () => window.clearInterval(timer);
  }, [capture, status]);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      streakRef.current = 0;
      setStreak(0);
      setStatus("live");
    } catch {
      setStatus("error");
      setError(
        "카메라를 열 수 없습니다. 브라우저의 카메라 권한을 확인해주세요.",
      );
    }
  }, []);

  const retake = useCallback(() => {
    setCaptured(null);
    setCapturedUrl(null);
    setLiveQuality(null);
    onCaptured(null);
    void connect();
  }, [connect, onCaptured]);
  const handleCapture = useCallback(() => void capture(), [capture]);
  const handleConnect = useCallback(() => void connect(), [connect]);

  if (!isMobile) {
    return (
      <div className="border-notice-border bg-notice text-notice-foreground mt-4 grid gap-2 rounded-[10px] border p-5.5 text-center">
        <strong>실시간 촬영은 스마트폰에서만 사용할 수 있습니다.</strong>
        <small className="leading-normal text-[#9b8658]">
          스마트폰 브라우저로 접속하면 시험지 가이드와 촬영 품질 검사, 자동
          촬영이 나타납니다.
        </small>
      </div>
    );
  }

  const live = status === "live";
  const badge = badgeOf(status, liveQuality, streak);
  const style = BADGE_STYLE[badge.tone];

  return (
    <div className="mt-4 grid gap-3">
      {status === "captured" && capturedUrl ? (
        <img
          src={capturedUrl}
          alt="촬영한 시험지"
          className="max-h-90 w-full rounded-[11px] bg-[#21302b] object-contain"
        />
      ) : (
        <div
          className={cn(
            "relative h-90 overflow-hidden rounded-[11px] bg-[#21302b]",
            badge.tone === "pass" && "shadow-[inset_0_0_0_3px_#2fae74]",
            badge.tone === "fail" && "shadow-[inset_0_0_0_3px_#e5484d]",
          )}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            aria-label="카메라 미리보기"
            className={cn(
              "absolute inset-0 size-full object-cover",
              !live && "hidden",
            )}
          />
          {!live && (
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-1 text-center text-[#d5e0dc]">
              <ScanLine className="size-7" />
              <strong>카메라 미리보기</strong>
              <small className="text-[11px] text-[#93a49e]">
                후면 카메라를 연결해주세요.
              </small>
            </div>
          )}
          {/* 시험지 가이드 프레임 */}
          <div className="absolute inset-[26px_12%] rounded-md border border-dashed border-white/60">
            {CORNERS.map((corner) => (
              <i
                key={corner}
                className={cn("absolute size-6", corner, style.corner)}
              />
            ))}
            <span className="absolute bottom-2.5 left-1/2 w-max -translate-x-1/2 rounded-full bg-black/30 px-2 py-1 text-[11px] text-white">
              시험지를 프레임 안에 맞춰주세요
            </span>
          </div>
          <div
            role="status"
            className={cn(
              "absolute top-3 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px]",
              style.box,
            )}
          >
            <span
              className={cn("size-1.75 shrink-0 rounded-full", style.dot)}
            />
            <strong className="truncate">{badge.text}</strong>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
      {captured && <PhotoQualityReport quality={captured.quality} />}

      <div className="flex justify-end gap-2">
        {status === "captured" ? (
          <Button variant="secondary" onClick={retake}>
            다시 찍기
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={handleConnect}
              disabled={status === "starting" || live}
            >
              카메라 연결
            </Button>
            <Button onClick={handleCapture} disabled={!live}>
              촬영하기
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
