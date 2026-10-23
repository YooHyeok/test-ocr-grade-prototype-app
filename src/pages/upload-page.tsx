import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import SheetPicker from "@/components/upload/sheet-picker";
import CaptureTabs, {
  type CaptureMode,
} from "@/components/upload/capture-tabs";
import PhotoDropzone from "@/components/upload/photo-dropzone";
import CameraPanel from "@/components/upload/camera-panel";

/**
 * 시험지 첨부 페이지. (프로토타입에서는 모달 — 추후 모달 전환 검토)
 * @returns {JSX.Element}
 */
export default function UploadPage() {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");

  return (
    <section className="surface mx-auto mt-4 max-w-[690px] p-7 max-sm:p-4">
      <SheetPicker />
      <CaptureTabs value={captureMode} onChange={setCaptureMode} />
      {captureMode === "photo" ? <PhotoDropzone /> : <CameraPanel />}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" asChild>
          <Link to="/my-papers">취소</Link>
        </Button>
        <Button>업로드 저장</Button>
      </div>
    </section>
  );
}
