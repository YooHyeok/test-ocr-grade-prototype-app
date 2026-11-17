import { useCallback, useId, useMemo, type ChangeEvent } from "react";
import ToggleSwitch from "@/components/toggle-switch";
import type { SystemSetting } from "@/lib/backend/types";
import {
  joinMultiValue,
  splitMultiValue,
  validateSettingValue,
} from "@/lib/system-settings";
import { cn } from "@/lib/utils";

type Props = Pick<SystemSetting, "type" | "options"> & {
  value: string;
  onChange: (value: string) => void;
  /** 화면 낭독기용 이름 */
  label: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const FIELD_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-[13px] outline-none focus-visible:border-primary disabled:bg-muted disabled:text-muted-foreground";
const CHOICE_LABEL_CLASS =
  "flex items-center gap-1.5 text-[13px] text-[#3c4943] has-[:disabled]:text-muted-foreground";

/**
 * 유형에 맞는 설정 값 입력. 목록과 추가·수정 창이 같은 모양으로 쓴다.
 * - String: 텍스트 입력 / Number: 숫자 입력 / Boolean: 토글 스위치(true·false)
 * - Radio: 라디오 묶음 / Select: 선택 상자 / Checkbox: 체크박스 묶음(여러 개, 쉼표로 이어 저장)
 * 규칙에 맞지 않는 값은 안내 문구를 보여준다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SettingValueInput({
  type,
  options,
  value,
  onChange,
  label,
  id,
  disabled,
  placeholder,
  className,
}: Readonly<Props>) {
  const groupName = useId();
  const error = useMemo(
    () => validateSettingValue({ type, options }, value),
    [type, options, value],
  );
  const selected = useMemo(() => splitMultiValue(value), [value]);
  const choices = useMemo(() => options ?? [], [options]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange(event.target.value),
    [onChange],
  );
  const handleToggle = useCallback(
    () => onChange(value === "true" ? "false" : "true"),
    [onChange, value],
  );
  const handleCheck = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value: option, checked } = event.target;
      const next = checked
        ? [...selected, option]
        : selected.filter((item) => item !== option);
      onChange(joinMultiValue(choices, next));
    },
    [choices, onChange, selected],
  );

  let field;
  switch (type) {
    case "BOOL":
      field = (
        <div className="flex h-9 items-center gap-2">
          <ToggleSwitch
            id={id}
            checked={value === "true"}
            onToggle={handleToggle}
            label={label}
            disabled={disabled}
          />
          <span className="font-mono text-xs text-[#56635e]">
            {value === "true" ? "true" : "false"}
          </span>
        </div>
      );
      break;
    case "RADIO":
    case "CHECK":
      field = (
        <div
          id={id}
          role={type === "RADIO" ? "radiogroup" : "group"}
          aria-label={label}
          className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1.5"
        >
          {choices.map((option) => (
            <label key={option} className={CHOICE_LABEL_CLASS}>
              <input
                type={type === "RADIO" ? "radio" : "checkbox"}
                name={groupName}
                value={option}
                checked={
                  type === "RADIO"
                    ? value === option
                    : selected.includes(option)
                }
                onChange={type === "RADIO" ? handleChange : handleCheck}
                disabled={disabled}
                className="accent-primary"
              />
              {option}
            </label>
          ))}
          {choices.length === 0 && (
            <span className="text-muted-foreground text-xs">
              선택지가 없습니다.
            </span>
          )}
        </div>
      );
      break;
    case "SEL":
      field = (
        <select
          id={id}
          aria-label={label}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={FIELD_CLASS}
        >
          <option value="">{placeholder ?? "선택"}</option>
          {choices.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
      break;
    default:
      field = (
        <input
          id={id}
          type={type === "NUM" ? "number" : "text"}
          step={type === "NUM" ? "any" : undefined}
          aria-label={label}
          aria-invalid={Boolean(error)}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(FIELD_CLASS, error && "border-destructive")}
        />
      );
  }

  return (
    <div className={cn("grid gap-1", className)}>
      {field}
      {error && <p className="text-destructive text-[11px]">{error}</p>}
    </div>
  );
}
