import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
} from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { analyzePhotoFile, type PhotoQuality } from "@/lib/photo-quality";
import PhotoQualityReport from "./photo-quality-report";

/** 검사를 마친 사진 */
export type CheckedPhoto = {
  file: File;
  quality: PhotoQuality;
};

type Props = {
  /** 검사가 끝나면 결과를, 사진을 지우거나 읽지 못하면 null을 넘긴다. */
  onChecked: (photo: CheckedPhoto | null) => void;
};

/**
 * 시험지 사진 첨부 영역. 사진을 고르면 바로 미리보기와 촬영 품질 검사(밝기·흔들림·반사·해상도)를 보여준다.
 * TODO: 정렬 마커 검출·자동 앵글 보정(OpenCV) 연결
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function PhotoDropzone({ onChecked }: Readonly<Props>) {
  const inputId = useId();
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<PhotoQuality | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미리보기 주소는 사진이 바뀌거나 화면을 떠날 때 해제한다.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setQuality(null);
      setError(null);
      setFileName(file?.name ?? "");
      setPreviewUrl(file ? URL.createObjectURL(file) : null);
      onChecked(null);
      if (!file) return;

      setChecking(true);
      try {
        const result = await analyzePhotoFile(file);
        setQuality(result);
        onChecked({ file, quality: result });
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "사진을 확인하지 못했습니다.",
        );
      } finally {
        setChecking(false);
      }
    },
    [onChecked],
  );

  return (
    <div className="mt-4 grid gap-3">
      <input
        id={inputId}
        type="file"
        accept="image/*,.heic"
        onChange={handleChange}
        className="sr-only"
        data-testid="photo-input"
      />
      <label
        htmlFor={inputId}
        className="text-primary grid w-full cursor-pointer place-items-center gap-1 rounded-[10px] border border-dashed border-[#a7c5ba] bg-[#f5fbf8] p-5.5 text-center"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="첨부한 시험지 미리보기"
            className="mb-2 max-h-56 rounded-md border border-[#dfe8e3] object-contain"
          />
        ) : (
          <span className="mb-1 grid size-8 place-items-center rounded-full bg-[#dff1e8]">
            <ArrowUp className="size-4" />
          </span>
        )}
        <strong>{fileName || "시험지 사진을 올려주세요"}</strong>
        <small className="text-[#8c9a95]">
          {fileName
            ? "다른 사진을 고르려면 다시 누르세요."
            : "올리면 바로 밝기·흔들림·빛 반사를 검사합니다."}
        </small>
      </label>

      {checking && (
        <p
          role="status"
          className="text-muted-foreground flex items-center gap-2 text-xs"
        >
          <LoaderCircle className="size-4 animate-spin" />
          촬영 품질을 검사하는 중...
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
      {quality && <PhotoQualityReport quality={quality} />}
    </div>
  );
}
