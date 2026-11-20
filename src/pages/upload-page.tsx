import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SegmentedTabs, { type TabOption } from "@/components/segmented-tabs";
import SheetPicker from "@/components/upload/sheet-picker";
import PhotoDropzone, {
  type CheckedPhoto,
} from "@/components/upload/photo-dropzone";
import CameraPanel from "@/components/upload/camera-panel";

type CaptureMode = "photo" | "camera";

const CAPTURE_TABS: TabOption<CaptureMode>[] = [
  { value: "photo", label: "사진 첨부" },
  { value: "camera", label: "실시간 촬영" },
];

/**
 * 시험지 첨부 페이지. 사진 첨부·실시간 촬영 모두 촬영 품질 검사를 통과해야 저장할 수 있다. (기획서 §12)
 * TODO: Storage 업로드·채점 작업 생성 연결 (지금은 데모 안내만)
 * @returns {JSX.Element}
 */
export default function UploadPage() {
  const navigate = useNavigate();
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");
  const [photo, setPhoto] = useState<CheckedPhoto | null>(null);

  const handleModeChange = useCallback((mode: CaptureMode) => {
    setCaptureMode(mode);
    setPhoto(null);
  }, []);
  const handleSave = useCallback(() => {
    if (!photo?.quality.ok) return;
    toast.success("시험지 사진을 저장했습니다. (데모)", {
      position: "top-center",
    });
    void navigate("/my-papers");
  }, [navigate, photo]);

  let hint = "사진을 올리거나 찍으면 촬영 품질을 검사합니다.";
  if (photo && !photo.quality.ok) hint = "다시 찍어야 저장할 수 있습니다.";
  else if (photo) hint = "";

  return (
    <section className="surface mx-auto mt-4 max-w-[690px] p-7 max-sm:p-4">
      <SheetPicker />
      <SegmentedTabs
        options={CAPTURE_TABS}
        value={captureMode}
        onChange={handleModeChange}
        ariaLabel="업로드 방식"
        className="mt-4.5 grid w-full grid-cols-2"
      />
      {captureMode === "photo" ? (
        <PhotoDropzone onChecked={setPhoto} />
      ) : (
        <CameraPanel onCaptured={setPhoto} />
      )}
      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {hint && (
          <p className="text-muted-foreground mr-auto text-xs">{hint}</p>
        )}
        <Button variant="secondary" asChild>
          <Link to="/my-papers">취소</Link>
        </Button>
        <Button onClick={handleSave} disabled={!photo?.quality.ok}>
          업로드 저장
        </Button>
      </div>
    </section>
  );
}
