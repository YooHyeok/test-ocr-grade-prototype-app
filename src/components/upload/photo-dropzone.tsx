import { useCallback, useId, useState, type ChangeEvent } from "react";
import { ArrowUp } from "lucide-react";

/**
 * 시험지 사진 첨부 영역. 선택한 파일명을 표시한다.
 * TODO: 미리보기, 자동 앵글 보정(OpenCV) 연결
 * @returns {JSX.Element}
 */
export default function PhotoDropzone() {
  const inputId = useId();
  const [fileName, setFileName] = useState("");

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? "");
  }, []);

  return (
    <>
      <input
        id={inputId}
        type="file"
        accept="image/*,.heic"
        onChange={handleChange}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        className="text-primary mt-4 grid w-full cursor-pointer place-items-center rounded-[10px] border border-dashed border-[#a7c5ba] bg-[#f5fbf8] p-5.5"
      >
        <span className="mb-2 grid size-8 place-items-center rounded-full bg-[#dff1e8]">
          <ArrowUp className="size-4" />
        </span>
        <strong>{fileName || "시험지 사진을 올려주세요"}</strong>
        <small className="mt-1 text-[#8c9a95]">
          첨부한 이미지는 시험지 앵글에 맞게 자동 보정합니다.
        </small>
      </label>
    </>
  );
}
