import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { TERMS, type TermsDoc, type TermsKey } from "@/lib/terms";
import TermsDialog from "./terms-dialog";

/** 약관별 동의 여부 */
export type TermsAgreed = Record<TermsKey, boolean>;

type Props = {
  agreed: TermsAgreed;
  onChange: (agreed: TermsAgreed) => void;
  disabled?: boolean;
};

const CHECKBOX = "accent-primary size-4";

/**
 * 필수 약관 동의 (전체 동의 + 약관별 체크·보기).
 * 보기를 누르면 약관 전문 창이 뜨고, 창에서 동의하면 그 약관에 체크된다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function TermsAgreement({
  agreed,
  onChange,
  disabled,
}: Readonly<Props>) {
  const [viewing, setViewing] = useState<TermsDoc | null>(null);
  const allAgreed = useMemo(
    () => TERMS.every((doc) => agreed[doc.key]),
    [agreed],
  );

  const handleAll = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      onChange({ service: checked, privacy: checked });
    },
    [onChange],
  );
  const handleOne = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      onChange({
        ...agreed,
        [event.target.value as TermsKey]: event.target.checked,
      }),
    [agreed, onChange],
  );
  const handleView = useCallback(
    (event: { currentTarget: HTMLButtonElement }) => {
      setViewing(
        TERMS.find((doc) => doc.key === event.currentTarget.value) ?? null,
      );
    },
    [],
  );
  const handleClose = useCallback(() => setViewing(null), []);
  const handleAgree = useCallback(
    (doc: TermsDoc) => {
      onChange({ ...agreed, [doc.key]: true });
      setViewing(null);
    },
    [agreed, onChange],
  );

  return (
    <div className="bg-card grid gap-2 rounded-[10px] border px-3.5 py-3">
      <label className="flex items-center gap-2 border-b pb-2 text-[13px] font-bold">
        <input
          type="checkbox"
          checked={allAgreed}
          onChange={handleAll}
          disabled={disabled}
          className={CHECKBOX}
          data-testid="agree-all"
        />
        전체 동의
      </label>
      {TERMS.map((doc) => (
        <div
          key={doc.key}
          className="flex items-center justify-between gap-2.5"
        >
          <label className="flex items-center gap-2 text-[13px] text-[#56635e]">
            <input
              type="checkbox"
              value={doc.key}
              checked={agreed[doc.key]}
              onChange={handleOne}
              disabled={disabled}
              className={CHECKBOX}
              data-testid={`agree-${doc.key}`}
            />
            {doc.label}
          </label>
          <button
            type="button"
            value={doc.key}
            onClick={handleView}
            className="hover:text-primary shrink-0 px-1 text-xs text-[#7b8984] underline underline-offset-[3px]"
            data-testid={`terms-view-${doc.key}`}
          >
            보기
          </button>
        </div>
      ))}
      <TermsDialog
        doc={viewing}
        agreed={viewing ? agreed[viewing.key] : false}
        onAgree={handleAgree}
        onClose={handleClose}
      />
    </div>
  );
}
