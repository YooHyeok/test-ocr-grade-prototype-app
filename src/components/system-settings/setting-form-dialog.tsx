import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  SystemSettingAccess,
  SystemSettingGroup,
  SystemSettingInput,
  SystemSettingType,
} from "@/lib/backend/types";
import {
  CHOICE_TYPES,
  CODE_SEGMENT_PATTERN,
  SETTING_ACCESS_LABEL,
  SETTING_TYPE_LABEL,
  joinMultiValue,
  rootCode,
  splitMultiValue,
  validateSettingValue,
} from "@/lib/system-settings";
import { cn } from "@/lib/utils";
import OptionListEditor from "./option-list-editor";
import SettingValueInput from "./setting-value-input";

type Props = {
  mode: "create" | "update";
  /** 수정할 설정 (추가면 null) */
  initial: SystemSettingInput | null;
  groups: SystemSettingGroup[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: SystemSettingInput) => void;
};

type Form = {
  /** 소속 그룹 코드 (최상위 또는 하위) */
  ownerId: string;
  /** 키 이름 (그룹 코드 뒤에 붙는 부분) */
  keyName: string;
  name: string;
  type: SystemSettingType | "";
  value: string;
  /** 선택지 (Radio·Select·Checkbox) */
  options: string[];
  description: string;
  access: SystemSettingAccess | "";
};

const TYPES = Object.keys(SETTING_TYPE_LABEL) as SystemSettingType[];
const ACCESSES: SystemSettingAccess[] = ["R", "W", "H"];
const FIELD_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-[13px] outline-none focus-visible:border-primary disabled:bg-muted disabled:text-muted-foreground";

/**
 * 폼 한 줄 (왼쪽 라벨, 오른쪽 입력).
 * @param {{ label: string, required?: boolean, htmlFor?: string, error?: string | null, children: ReactNode }} props
 * @returns {JSX.Element}
 */
function Field({
  label,
  required,
  htmlFor,
  error,
  children,
}: Readonly<{
  label: string;
  required?: boolean;
  htmlFor?: string;
  error?: string | null;
  children: ReactNode;
}>) {
  return (
    <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-[#3c4943]">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="grid gap-1">
        {children}
        {error && <p className="text-destructive text-[11px]">{error}</p>}
      </div>
    </div>
  );
}

/**
 * 설정 추가·수정 창. 키 = 상위그룹 코드 + "." + 입력한 키(영문 대문자).
 * 상위그룹·키는 추가할 때만 정할 수 있다. 열 때마다 부모가 다시 마운트해 입력값을 초기화한다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SettingFormDialog({
  mode,
  initial,
  groups,
  isPending,
  onOpenChange,
  onSubmit,
}: Readonly<Props>) {
  const [form, setForm] = useState<Form>(() => {
    if (!initial)
      return {
        ownerId: "",
        keyName: "",
        name: "",
        type: "",
        value: "",
        options: [],
        description: "",
        access: "",
      };
    const ownerId = initial.subGroupId ?? initial.groupId;
    return {
      ownerId,
      keyName: initial.key.slice(ownerId.length + 1),
      name: initial.name,
      type: initial.type,
      value: initial.value ?? "",
      options: initial.options ?? [],
      description: initial.description ?? "",
      access: initial.access,
    };
  });
  const [submitted, setSubmitted] = useState(false);

  const isChoice = form.type !== "" && CHOICE_TYPES.has(form.type);
  const options = useMemo(
    () => (isChoice ? form.options : null),
    [isChoice, form.options],
  );
  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.id.localeCompare(b.id)),
    [groups],
  );
  const fullKey =
    form.ownerId && form.keyName ? `${form.ownerId}.${form.keyName}` : "";

  const errors = useMemo(
    () => ({
      ownerId: form.ownerId ? null : "상위그룹을 선택하세요.",
      keyName: CODE_SEGMENT_PATTERN.test(form.keyName)
        ? null
        : "영문 대문자로 시작하고 대문자·숫자·밑줄(_)만 쓸 수 있습니다.",
      name: form.name.trim() ? null : "속성명을 입력하세요.",
      type: form.type ? null : "유형을 선택하세요.",
      value: form.type
        ? validateSettingValue({ type: form.type, options }, form.value)
        : null,
      access: form.access ? null : "열람 권한을 선택하세요.",
    }),
    [form, options],
  );
  const isComplete = Boolean(
    form.ownerId &&
    form.keyName &&
    form.name.trim() &&
    form.type &&
    form.access &&
    (!isChoice || form.options.length > 0),
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setForm((prev) => ({
        ...prev,
        [name]: name === "keyName" ? value.toUpperCase() : value,
        // 유형을 바꾸면 값을 비우고(Boolean은 false), 선택형끼리는 선택지를 그대로 둔다.
        ...(name === "type"
          ? {
              value: value === "BOOL" ? "false" : "",
              options: CHOICE_TYPES.has(value as SystemSettingType)
                ? prev.options
                : [],
            }
          : {}),
      }));
    },
    [],
  );
  const handleOptions = useCallback(
    (next: string[]) =>
      setForm((prev) => ({
        ...prev,
        options: next,
        // 지운 선택지는 고른 값에서도 뺀다.
        value:
          prev.type === "CHECK"
            ? joinMultiValue(next, splitMultiValue(prev.value))
            : next.includes(prev.value)
              ? prev.value
              : "",
      })),
    [],
  );
  const handleValue = useCallback(
    (value: string) => setForm((prev) => ({ ...prev, value })),
    [],
  );
  const handleCancel = useCallback(() => onOpenChange(false), [onOpenChange]);
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      if (Object.values(errors).some(Boolean) || !form.type || !form.access)
        return;
      const groupId = rootCode(form.ownerId);
      onSubmit({
        key: fullKey,
        groupId,
        subGroupId: form.ownerId === groupId ? null : form.ownerId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        type: form.type,
        value: form.value || null,
        options,
        access: form.access,
      });
    },
    [errors, form, fullKey, onSubmit, options],
  );

  const shown = (message: string | null) => (submitted ? message : null);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "설정 추가" : "설정 수정"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            상위그룹, 키, 속성명, 유형, 값, 설명, 열람 권한을 입력합니다.
          </DialogDescription>
        </DialogHeader>

        <form
          id="setting-form"
          onSubmit={handleSubmit}
          className="grid gap-3.5 border-t pt-5"
        >
          <Field
            label="상위그룹"
            required
            htmlFor="setting-owner"
            error={shown(errors.ownerId)}
          >
            <select
              id="setting-owner"
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
              disabled={mode === "update"}
              className={FIELD_CLASS}
            >
              <option value="">상위그룹 선택</option>
              {sortedGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.id} ({group.name})
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="키"
            required
            htmlFor="setting-key"
            error={shown(errors.keyName)}
          >
            <input
              id="setting-key"
              name="keyName"
              value={form.keyName}
              onChange={handleChange}
              disabled={mode === "update"}
              placeholder="키 입력 (영문 대문자)"
              className={cn(FIELD_CLASS, "font-mono")}
            />
            {fullKey && (
              <p className="text-[11px] text-[#7b8984]">
                저장될 키: <code>{fullKey}</code>
              </p>
            )}
          </Field>
          <Field
            label="속성명"
            required
            htmlFor="setting-name"
            error={shown(errors.name)}
          >
            <input
              id="setting-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="속성명 입력"
              className={FIELD_CLASS}
            />
          </Field>
          <Field
            label="유형"
            required
            htmlFor="setting-type"
            error={shown(errors.type)}
          >
            <select
              id="setting-type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className={FIELD_CLASS}
            >
              <option value="">타입 선택</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {SETTING_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </Field>
          {isChoice && (
            <Field
              label="선택지"
              required
              htmlFor="setting-option"
              error={shown(
                form.options.length ? null : "선택지를 하나 이상 추가하세요.",
              )}
            >
              <OptionListEditor
                id="setting-option"
                options={form.options}
                onChange={handleOptions}
              />
            </Field>
          )}
          <Field label="값 입력" htmlFor="setting-value">
            <SettingValueInput
              id="setting-value"
              type={form.type || "STR"}
              options={options}
              value={form.value}
              onChange={handleValue}
              label="설정 값"
              placeholder="값 입력"
            />
          </Field>
          <Field label="설명" htmlFor="setting-description">
            <input
              id="setting-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={200}
              placeholder="설명 입력"
              className={FIELD_CLASS}
            />
          </Field>
          <Field label="열람 권한" required error={shown(errors.access)}>
            <div
              role="radiogroup"
              aria-label="열람 권한"
              className="flex flex-wrap gap-x-4 gap-y-1.5"
            >
              {ACCESSES.map((access) => (
                <label
                  key={access}
                  className="flex items-center gap-1.5 text-[13px] text-[#3c4943]"
                >
                  <input
                    id={`setting-access-${access}`}
                    type="radio"
                    name="access"
                    value={access}
                    checked={form.access === access}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  {SETTING_ACCESS_LABEL[access]}
                </label>
              ))}
            </div>
          </Field>
        </form>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            취소
          </Button>
          <Button
            type="submit"
            form="setting-form"
            disabled={isPending || !isComplete}
          >
            {isPending ? "저장 중..." : "확인"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
