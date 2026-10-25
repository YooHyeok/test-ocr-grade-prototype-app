type Props = {
  label: string;
  value: string | number;
  placeholder?: string;
  /** TODO: 편집 모드에서 false로 전환 */
  disabled?: boolean;
};

/**
 * 문항 요약 패널의 입력 칸 하나 (허용 표기, X/Y/W/H 좌표).
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SummaryField({
  label,
  value,
  placeholder,
  disabled = true,
}: Readonly<Props>) {
  return (
    <label className="mt-3 grid gap-1 text-[11px] font-bold text-[#68746f]">
      {label}
      <input
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        readOnly
        className="field h-[38px] w-full min-w-0 rounded-md disabled:cursor-not-allowed disabled:bg-[#f3f5f3] disabled:text-[#9aa39e]"
      />
    </label>
  );
}
