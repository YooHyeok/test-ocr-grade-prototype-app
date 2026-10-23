import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOBILE_QUERY, useMediaQuery } from "@/hooks/use-media-query";

/**
 * 실시간 촬영 영역. 데스크톱에서는 스마트폰 전용 안내만, 모바일에서는 카메라 화면과 가이드 프레임을 표시한다.
 * TODO: 후면 카메라 연결, 촬영 품질 검사(정렬 마커·블러·글레어) 및 자동 촬영 (PRODUCT_PLAN §12)
 * @returns {JSX.Element}
 */
export default function CameraPanel() {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  if (!isMobile) {
    return (
      <div className="border-notice-border bg-notice text-notice-foreground mt-4 grid gap-2 rounded-[10px] border p-5.5 text-center">
        <strong>실시간 촬영은 스마트폰에서만 사용할 수 있습니다.</strong>
        <small className="leading-normal text-[#9b8658]">
          스마트폰 브라우저로 접속하면 시험지 앵글 가이드와 인식 성공 표시가
          나타납니다.
        </small>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 h-[360px] overflow-hidden rounded-[11px] bg-[#21302b]">
        <div className="absolute inset-0 grid place-content-center justify-items-center gap-1 text-center text-[#d5e0dc]">
          <ScanLine className="size-7" />
          <strong>카메라 미리보기</strong>
          <small className="text-[11px] text-[#93a49e]">
            후면 카메라를 연결해주세요.
          </small>
        </div>
        {/* 시험지 가이드 프레임 */}
        <div className="absolute inset-[26px_12%] rounded-md border border-dashed border-white/60">
          <i className="absolute -top-0.5 -left-0.5 size-6 border-t-3 border-l-3 border-[#f5d877]" />
          <i className="absolute -top-0.5 -right-0.5 size-6 border-t-3 border-r-3 border-[#f5d877]" />
          <i className="absolute -right-0.5 -bottom-0.5 size-6 border-r-3 border-b-3 border-[#f5d877]" />
          <i className="absolute -bottom-0.5 -left-0.5 size-6 border-b-3 border-l-3 border-[#f5d877]" />
          <span className="absolute bottom-2.5 left-1/2 w-max -translate-x-1/2 rounded-full bg-black/30 px-2 py-1 text-[11px] text-white">
            시험지를 프레임 안에 맞춰주세요
          </span>
        </div>
        <div className="absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#1b2723]/70 px-2.5 py-1.5 text-[11px] text-[#fff5d2]">
          <span className="size-[7px] rounded-full bg-[#f5d877]" />
          <strong>시험지 정렬 확인 중</strong>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="secondary">카메라 연결</Button>
        <Button disabled>촬영하기</Button>
      </div>
    </>
  );
}
