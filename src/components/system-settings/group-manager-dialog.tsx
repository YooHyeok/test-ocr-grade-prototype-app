import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteSystemSettingGroup } from "@/hooks/mutations/system-settings/use-delete-system-setting-group";
import { useSaveSystemSettingGroup } from "@/hooks/mutations/system-settings/use-save-system-setting-group";
import type { SystemSettingGroup } from "@/lib/backend/types";
import { getErrorMessage } from "@/lib/error";
import { CODE_SEGMENT_PATTERN, parentCode } from "@/lib/system-settings";
import { cn } from "@/lib/utils";

type Props = {
  groups: SystemSettingGroup[];
  onOpenChange: (open: boolean) => void;
};

const FIELD_CLASS =
  "border-input bg-background h-9 w-full rounded-md border px-3 text-[13px] outline-none focus-visible:border-primary";
const LABEL_CLASS = "grid gap-1.5 text-xs text-[#68746f]";
const TOAST_OPTIONS = { position: "top-center" } as const;
const EMPTY_FORM = { parentId: "", code: "", name: "", description: "" };

/**
 * 그룹 설명 칸. 포커스가 빠지거나 Enter를 누르면 바뀐 경우에만 저장한다.
 * @param {{ group: SystemSettingGroup, onSave: (group: SystemSettingGroup) => void }} props
 * @returns {JSX.Element}
 */
function DescriptionInput({
  group,
  onSave,
}: Readonly<{
  group: SystemSettingGroup;
  onSave: (group: SystemSettingGroup) => void;
}>) {
  const [value, setValue] = useState(group.description ?? "");
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
    [],
  );
  const handleBlur = useCallback(() => {
    if (value.trim() !== (group.description ?? ""))
      onSave({ ...group, description: value.trim() || null });
  }, [group, onSave, value]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") event.currentTarget.blur();
    },
    [],
  );

  return (
    <input
      aria-label={`${group.name} 그룹 설명`}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      maxLength={200}
      placeholder="그룹 설명 입력"
      className={FIELD_CLASS}
    />
  );
}

/**
 * 그룹 관리 창. 위에서 상위 그룹을 골라 그룹을 추가하고, 아래 표에서 설명 수정·삭제를 한다.
 * 그룹 코드 = 상위 그룹 코드 + "." + 입력한 코드 (상위 그룹이 없으면 최상위 = 화면 탭)
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function GroupManagerDialog({
  groups,
  onOpenChange,
}: Readonly<Props>) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<SystemSettingGroup | null>(
    null,
  );

  const sortedGroups = useMemo(
    () => [...groups].sort((a, b) => a.id.localeCompare(b.id)),
    [groups],
  );
  const fullCode = form.parentId ? `${form.parentId}.${form.code}` : form.code;
  const codeError =
    form.code && !CODE_SEGMENT_PATTERN.test(form.code)
      ? "영문 대문자로 시작하고 대문자·숫자·밑줄(_)만 쓸 수 있습니다."
      : null;
  const canAdd = Boolean(form.code && !codeError && form.name.trim());

  const showError = useCallback(
    (error: Error) => toast.error(getErrorMessage(error), TOAST_OPTIONS),
    [],
  );
  const { mutate: addGroup, isPending: isAdding } = useSaveSystemSettingGroup({
    onSuccess: () => {
      setForm((prev) => ({ ...EMPTY_FORM, parentId: prev.parentId }));
      toast.success("그룹을 추가했습니다.", TOAST_OPTIONS);
    },
    onError: showError,
  });
  const { mutate: updateGroup } = useSaveSystemSettingGroup({
    onSuccess: () => toast.success("그룹 설명을 저장했습니다.", TOAST_OPTIONS),
    onError: showError,
  });
  const { mutate: deleteGroup, isPending: isDeleting } =
    useDeleteSystemSettingGroup({
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success("그룹을 삭제했습니다.", TOAST_OPTIONS);
      },
      onError: showError,
    });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setForm((prev) => ({
        ...prev,
        [name]: name === "code" ? value.toUpperCase() : value,
      }));
    },
    [],
  );
  const handleAdd = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canAdd) return;
      addGroup({
        mode: "create",
        group: {
          id: fullCode,
          name: form.name.trim(),
          description: form.description.trim() || null,
        },
      });
    },
    [addGroup, canAdd, form, fullCode],
  );
  const handleSaveDescription = useCallback(
    (group: SystemSettingGroup) => updateGroup({ mode: "update", group }),
    [updateGroup],
  );
  const handleDeleteClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setDeleteTarget(
        groups.find((group) => group.id === event.currentTarget.value) ?? null,
      ),
    [groups],
  );
  const handleDeleteOpenChange = useCallback((open: boolean) => {
    if (!open) setDeleteTarget(null);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (deleteTarget) deleteGroup(deleteTarget.id);
  }, [deleteGroup, deleteTarget]);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>그룹 관리</DialogTitle>
          <DialogDescription className="sr-only">
            상위 그룹을 골라 그룹을 추가하고, 그룹 설명을 고치거나 그룹을
            삭제합니다.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleAdd}
          className="grid items-end gap-2 border-t pt-4 sm:grid-cols-[140px_1fr_1fr_1fr_auto]"
        >
          <label className={LABEL_CLASS}>
            상위 그룹
            <select
              id="group-parent"
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
              className={FIELD_CLASS}
            >
              <option value="">상위 그룹 선택</option>
              {sortedGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.id}
                </option>
              ))}
            </select>
          </label>
          <label className={LABEL_CLASS}>
            그룹코드
            <input
              id="group-code"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="그룹코드 입력"
              className={cn(
                FIELD_CLASS,
                "font-mono",
                codeError && "border-destructive",
              )}
            />
          </label>
          <label className={LABEL_CLASS}>
            그룹명
            <input
              id="group-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="그룹명 입력"
              className={FIELD_CLASS}
            />
          </label>
          <label className={LABEL_CLASS}>
            그룹 설명
            <input
              id="group-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={200}
              placeholder="그룹 설명 입력"
              className={FIELD_CLASS}
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            disabled={!canAdd || isAdding}
          >
            <Plus />
            그룹 추가
          </Button>
          <p className="text-[11px] text-[#7b8984] sm:col-span-5">
            {codeError ? (
              <span className="text-destructive">{codeError}</span>
            ) : (
              <>
                추가될 그룹코드: <code>{form.code ? fullCode : "-"}</code>
                {!form.parentId &&
                  " (상위 그룹을 고르지 않으면 최상위 그룹 = 화면 탭)"}
              </>
            )}
          </p>
        </form>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-[13px] whitespace-nowrap">
            <thead>
              <tr className="bg-[#f4f6f5] text-[#3c4943]">
                {["상위", "그룹코드", "그룹명", "그룹 설명", "삭제"].map(
                  (column) => (
                    <th
                      key={column}
                      className="border-b px-3 py-2.5 text-center font-bold"
                    >
                      {column}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map((group) => (
                <tr key={group.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-center">
                    {parentCode(group.id) ?? "최상위"}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs">
                    {group.id}
                  </td>
                  <td className="px-3 py-2 text-center">{group.name}</td>
                  <td className="min-w-56 px-3 py-1.5">
                    <DescriptionInput
                      key={group.description ?? ""}
                      group={group}
                      onSave={handleSaveDescription}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      value={group.id}
                      onClick={handleDeleteClick}
                      aria-label={`${group.name} 그룹 삭제`}
                      className="hover:text-destructive inline-grid size-8 place-items-center rounded-md text-[#56635e] hover:bg-[#eef2ef]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedGroups.length === 0 && (
            <p className="text-muted-foreground p-8 text-center text-sm">
              그룹이 없습니다. 위에서 최상위 그룹부터 추가하세요.
            </p>
          )}
        </div>

        {deleteTarget && (
          <ConfirmDeleteDialog
            title="그룹을 삭제할까요?"
            description={`${deleteTarget.name} (${deleteTarget.id}) 그룹을 삭제합니다. 하위 그룹이나 설정이 남아 있으면 삭제되지 않습니다.`}
            isPending={isDeleting}
            onConfirm={handleConfirmDelete}
            onOpenChange={handleDeleteOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
