import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { FolderCog, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import PageLoader from "@/components/page-loader";
import GroupManagerDialog from "@/components/system-settings/group-manager-dialog";
import SettingFormDialog from "@/components/system-settings/setting-form-dialog";
import SettingHistoryPanel from "@/components/system-settings/setting-history-panel";
import SettingSection from "@/components/system-settings/setting-section";
import { Button } from "@/components/ui/button";
import { useDeleteSystemSetting } from "@/hooks/mutations/system-settings/use-delete-system-setting";
import { useSaveSystemSetting } from "@/hooks/mutations/system-settings/use-save-system-setting";
import { useUpdateSystemSettingValues } from "@/hooks/mutations/system-settings/use-update-system-setting-values";
import { useSystemSettingGroupsData } from "@/hooks/queries/use-system-setting-groups-data";
import { useSystemSettingsData } from "@/hooks/queries/use-system-settings-data";
import type { SystemSetting, SystemSettingInput } from "@/lib/backend/types";
import { getErrorMessage } from "@/lib/error";
import {
  buildSections,
  diffSettingValues,
  parentCode,
  validateSettingValue,
} from "@/lib/system-settings";
import { cn } from "@/lib/utils";

/** 변경 이력 탭 값 (그룹 코드와 겹치지 않도록 소문자) */
const HISTORY_TAB = "history";
const TOAST_OPTIONS = { position: "top-center" } as const;

/** 열려 있는 창 (한 번에 하나) */
type DialogState =
  | {
      kind: "setting";
      mode: "create" | "update";
      initial: SystemSettingInput | null;
    }
  | { kind: "groups" }
  | { kind: "delete-setting"; setting: SystemSetting }
  | null;

/**
 * 시스템 설정 페이지 (시스템 관리자 전용). DELMA 시스템 설정 화면 구성을 따른다.
 * - 탭: 최상위 그룹(예: WM)별 설정 + 변경 이력
 * - 설정 탭: 검색, 그룹 관리·설정 추가·저장, 하위 그룹별 접는 구역 (속성명 | 값 | 설명 | 수정·삭제)
 * - 값은 바로 고치고 저장 버튼으로 한꺼번에 저장한다.
 * @returns {JSX.Element}
 */
export default function SystemSettingsPage() {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<DialogState>(null);

  const settingsQuery = useSystemSettingsData();
  const groupsQuery = useSystemSettingGroupsData();
  const settings = useMemo(
    () => settingsQuery.data ?? [],
    [settingsQuery.data],
  );
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const rootGroups = useMemo(
    () =>
      groups
        .filter((group) => parentCode(group.id) === null)
        .sort((a, b) => a.id.localeCompare(b.id)),
    [groups],
  );
  const tabItems = useMemo(
    () => [
      ...rootGroups.map((group) => ({
        value: group.id,
        label: group.id,
        title: group.name,
      })),
      { value: HISTORY_TAB, label: "변경 이력", title: "변경 이력" },
    ],
    [rootGroups],
  );
  // 선택한 탭이 삭제됐으면 첫 탭으로 돌아간다.
  const tab =
    selectedTab === HISTORY_TAB ||
    rootGroups.some((group) => group.id === selectedTab)
      ? selectedTab!
      : (rootGroups[0]?.id ?? HISTORY_TAB);

  const sections = useMemo(
    () => buildSections(settings, groups, { rootId: tab, query }),
    [settings, groups, tab, query],
  );
  const resultCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.settings.length, 0),
    [sections],
  );
  const changes = useMemo(
    () => diffSettingValues(settings, drafts),
    [settings, drafts],
  );
  const hasInvalid = useMemo(
    () =>
      changes.some((change) => {
        const setting = settings.find((item) => item.key === change.key);
        return setting && validateSettingValue(setting, change.value);
      }),
    [changes, settings],
  );

  const closeDialog = useCallback(() => setDialog(null), []);
  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeDialog();
    },
    [closeDialog],
  );
  const showError = useCallback(
    (error: Error) => toast.error(getErrorMessage(error), TOAST_OPTIONS),
    [],
  );

  const { mutate: saveValues, isPending: isSavingValues } =
    useUpdateSystemSettingValues({
      onSuccess: () => {
        setDrafts({});
        toast.success("저장했습니다.", TOAST_OPTIONS);
      },
      onError: showError,
    });
  const { mutate: saveSetting, isPending: isSavingSetting } =
    useSaveSystemSetting({
      onSuccess: () => {
        closeDialog();
        toast.success("설정을 저장했습니다.", TOAST_OPTIONS);
      },
      onError: showError,
    });
  const { mutate: deleteSetting, isPending: isDeletingSetting } =
    useDeleteSystemSetting({
      onSuccess: () => {
        closeDialog();
        toast.success("설정을 삭제했습니다.", TOAST_OPTIONS);
      },
      onError: showError,
    });

  const handleTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setSelectedTab(event.currentTarget.value),
    [],
  );
  const handleQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    [],
  );
  const handleValueChange = useCallback(
    (key: string, value: string) =>
      setDrafts((prev) => ({ ...prev, [key]: value })),
    [],
  );
  const handleRevertValue = useCallback(
    (key: string) =>
      setDrafts((prev) => {
        const { [key]: _reverted, ...rest } = prev;
        return rest;
      }),
    [],
  );
  const handleSaveValues = useCallback(
    () => saveValues(changes),
    [saveValues, changes],
  );
  const handleOpenGroups = useCallback(() => setDialog({ kind: "groups" }), []);
  const handleAddSetting = useCallback(
    () => setDialog({ kind: "setting", mode: "create", initial: null }),
    [],
  );
  const handleEditSetting = useCallback((setting: SystemSetting) => {
    const { id: _id, ...initial } = setting;
    setDialog({ kind: "setting", mode: "update", initial });
  }, []);
  const handleDeleteSetting = useCallback(
    (setting: SystemSetting) => setDialog({ kind: "delete-setting", setting }),
    [],
  );
  const handleSubmitSetting = useCallback(
    (input: SystemSettingInput) => {
      if (dialog?.kind !== "setting") return;
      saveSetting({ mode: dialog.mode, input });
      // 수정 창에서 값을 바꿨으면 표에서 고치던 값은 버린다.
      setDrafts((prev) => {
        const { [input.key]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [dialog, saveSetting],
  );
  const handleConfirmDelete = useCallback(() => {
    if (dialog?.kind === "delete-setting") deleteSetting(dialog.setting.key);
  }, [dialog, deleteSetting]);

  if (settingsQuery.isPending || groupsQuery.isPending) return <PageLoader />;
  if (settingsQuery.isError || groupsQuery.isError) {
    return (
      <section
        role="alert"
        className="surface mt-5.5 grid justify-items-start gap-3 p-5"
      >
        <h3 className="font-bold">시스템 설정을 불러오지 못했습니다</h3>
        <p className="text-muted-foreground text-sm">
          {getErrorMessage(settingsQuery.error ?? groupsQuery.error)}
        </p>
      </section>
    );
  }

  return (
    <div className="mt-2 grid gap-6">
      <nav
        role="tablist"
        aria-label="시스템 설정 탭"
        className="flex gap-7 border-b"
      >
        {tabItems.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            value={item.value}
            title={item.title}
            aria-selected={tab === item.value}
            onClick={handleTab}
            className={cn(
              "-mb-px border-b-2 border-transparent px-0.5 pt-1 pb-3 text-[15px] font-bold text-[#56635e]",
              tab === item.value && "border-primary text-primary",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === HISTORY_TAB ? (
        <SettingHistoryPanel rootGroups={rootGroups} />
      ) : (
        <div className="grid gap-4">
          <label className="border-input bg-background flex h-9 w-60 items-center gap-2 rounded-md border px-3 max-sm:w-full">
            <Search className="size-4 shrink-0 text-[#89938f]" />
            <input
              id="setting-search"
              type="search"
              value={query}
              onChange={handleQuery}
              placeholder="검색어 입력"
              aria-label="설정 검색"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-[#3c4943]">
              검색결과 총 <strong>{resultCount}</strong>건
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenGroups}>
                <FolderCog />
                그룹 관리
              </Button>
              <Button onClick={handleAddSetting}>
                <Plus />
                설정 추가
              </Button>
              <Button
                variant={changes.length > 0 ? "default" : "secondary"}
                onClick={handleSaveValues}
                disabled={changes.length === 0 || hasInvalid || isSavingValues}
                title={
                  hasInvalid
                    ? "잘못된 값을 고쳐야 저장할 수 있습니다."
                    : undefined
                }
              >
                {isSavingValues
                  ? "저장 중..."
                  : `저장${changes.length > 0 ? ` (${changes.length})` : ""}`}
              </Button>
            </div>
          </div>

          {sections.map((section) => (
            <SettingSection
              key={section.id}
              name={section.name}
              settings={section.settings}
              drafts={drafts}
              onValueChange={handleValueChange}
              onRevert={handleRevertValue}
              onEdit={handleEditSetting}
              onDelete={handleDeleteSetting}
              disabled={isSavingValues}
            />
          ))}
          {sections.length === 0 && (
            <p className="bg-card text-muted-foreground rounded-lg border p-10 text-center text-sm">
              {query
                ? "검색 결과가 없습니다."
                : "설정이 없습니다. 설정 추가로 만들어 보세요."}
            </p>
          )}
        </div>
      )}

      {dialog?.kind === "groups" && (
        <GroupManagerDialog
          groups={groups}
          onOpenChange={handleDialogOpenChange}
        />
      )}
      {dialog?.kind === "setting" && (
        <SettingFormDialog
          mode={dialog.mode}
          initial={dialog.initial}
          groups={groups}
          isPending={isSavingSetting}
          onOpenChange={handleDialogOpenChange}
          onSubmit={handleSubmitSetting}
        />
      )}
      {dialog?.kind === "delete-setting" && (
        <ConfirmDeleteDialog
          title="설정을 삭제할까요?"
          description={`${dialog.setting.name} (${dialog.setting.key}) 설정을 삭제합니다. 삭제 기록은 변경 이력에 남습니다.`}
          isPending={isDeletingSetting}
          onConfirm={handleConfirmDelete}
          onOpenChange={handleDialogOpenChange}
        />
      )}
    </div>
  );
}
