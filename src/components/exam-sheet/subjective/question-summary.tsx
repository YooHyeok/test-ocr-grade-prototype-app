import type { SubjectiveQuestion } from "@/type";
import SummaryField from "./summary-field";

type Props = {
  /** 0부터 시작하는 문항 index */
  index: number;
  question?: SubjectiveQuestion;
};

const COORDINATE_KEYS = ["x", "y", "w", "h"] as const;

/**
 * 선택한 주관식 문항의 허용 표기와 OCR 영역 좌표 요약.
 * 편집 모드 전까지는 입력을 비활성화한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function QuestionSummary({ index, question }: Readonly<Props>) {
  return (
    <aside className="bg-card mt-auto shrink-0 rounded-xl border p-4">
      <p className="eyebrow">OCR REGION SUMMARY</p>
      <h3 className="mb-4 font-bold">{index + 1}번 문항 요약</h3>

      <SummaryField
        label="허용 표기 변형"
        value={question?.aliases ?? ""}
        placeholder="쉼표로 구분해 입력"
      />

      <div className="mt-1 grid grid-cols-2 gap-x-2">
        {COORDINATE_KEYS.map((key) => (
          <SummaryField
            key={key}
            label={key.toUpperCase()}
            value={question?.region[key] ?? ""}
          />
        ))}
      </div>

      <p className="mx-0.5 mt-2.5 text-[11px] leading-[1.55] text-[#87938f]">
        좌표는 시험지 원본 이미지 기준으로 저장됩니다. 학생이 올린 사진은 원근
        보정 후 같은 좌표로 OCR 영역을 잘라냅니다.
      </p>
    </aside>
  );
}
