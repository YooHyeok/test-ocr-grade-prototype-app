import { useCallback } from "react";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { SystemSetting } from "@/lib/backend/types";
import { cn } from "@/lib/utils";
import SettingValueInput from "./setting-value-input";

type Props = {
  setting: SystemSetting;
  /** 화면에서 고친 값 (없으면 저장된 값) */
  draft: string | undefined;
  onValueChange: (key: string, value: string) => void;
  /** 고친 값을 저장된 값으로 되돌린다. */
  onRevert: (key: string) => void;
  onEdit: (setting: SystemSetting) => void;
  onDelete: (setting: SystemSetting) => void;
  disabled?: boolean;
};

const ICON_BUTTON =
  "grid size-8 place-items-center rounded-md text-[#56635e] hover:bg-[#eef2ef]";

/**
 * 시스템 설정 한 줄: 속성명 | 값 입력 | 설명 | 수정·삭제.
 * 값은 바로 고치고 위의 저장 버튼으로 한꺼번에 저장한다. 열람만 가능(R)한 설정은 값을 고칠 수 없다.
 * 저장 전 고친 행은 왼쪽 강조선·"변경됨" 배지·되돌리기 버튼으로 표시한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SettingRow({
  setting,
  draft,
  onValueChange,
  onRevert,
  onEdit,
  onDelete,
  disabled,
}: Readonly<Props>) {
  const value = draft ?? setting.value ?? "";
  const isDirty = draft !== undefined && draft !== (setting.value ?? "");

  const handleChange = useCallback(
    (next: string) => onValueChange(setting.key, next),
    [onValueChange, setting.key],
  );
  const handleRevert = useCallback(
    () => onRevert(setting.key),
    [onRevert, setting.key],
  );
  const handleEdit = useCallback(() => onEdit(setting), [onEdit, setting]);
  const handleDelete = useCallback(
    () => onDelete(setting),
    [onDelete, setting],
  );

  return (
    <div
      className={cn(
        "grid items-center gap-x-4 gap-y-2 border-t px-4 py-3 transition-colors md:grid-cols-[190px_320px_minmax(0,1fr)_auto]",
        isDirty && "bg-[#fffbf0] shadow-[inset_3px_0_0_#f0b429]",
      )}
    >
      <div className="grid justify-items-start gap-1">
        <span className="text-[13px] text-[#3c4943]" title={setting.key}>
          {setting.name}
        </span>
        {isDirty && (
          <span
            title={`저장된 값: ${setting.value || "(없음)"}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#fff1cc] px-2 py-0.5 text-[10px] font-semibold text-[#8a6100]"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-[#f0b429]" />
            변경됨
          </span>
        )}
      </div>
      <SettingValueInput
        type={setting.type}
        options={setting.options}
        value={value}
        onChange={handleChange}
        label={`${setting.name} 값`}
        disabled={disabled || setting.access === "R"}
      />
      <p className="text-xs leading-relaxed text-[#68746f]">
        {setting.description}
      </p>
      <div className="flex gap-1 justify-self-end">
        {isDirty && (
          <button
            type="button"
            onClick={handleRevert}
            aria-label={`${setting.name} 되돌리기`}
            title="저장된 값으로 되돌리기"
            className={cn(ICON_BUTTON, "text-[#b07d00] hover:bg-[#fff1cc]")}
          >
            <RotateCcw className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleEdit}
          aria-label={`${setting.name} 수정`}
          className={ICON_BUTTON}
        >
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`${setting.name} 삭제`}
          className={cn(ICON_BUTTON, "hover:text-destructive")}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
