import { cn } from "@/lib/utils";

type Props = {
  checked: boolean;
  onToggle: () => void;
  /** 화면 낭독기용 이름 */
  label: string;
  disabled?: boolean;
  id?: string;
};

/**
 * 켜기/끄기 토글 스위치.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function ToggleSwitch({
  checked,
  onToggle,
  label,
  disabled,
  id,
}: Readonly<Props>) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "focus-visible:ring-ring/50 relative h-6 w-11 shrink-0 rounded-full bg-[#d5ddd9] transition-colors outline-none focus-visible:ring-[3px] disabled:opacity-50",
        checked && "bg-primary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}
