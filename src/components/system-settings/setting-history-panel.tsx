import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { CalendarDays, Search, X } from "lucide-react";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { useSystemSettingHistoriesData } from "@/hooks/queries/use-system-setting-histories-data";
import type {
  SystemSettingGroup,
  SystemSettingHistoryQuery,
} from "@/lib/backend/types";
import { getErrorMessage } from "@/lib/error";
import { SETTING_ACTION_LABEL, kstToday } from "@/lib/system-settings";
import { cn } from "@/lib/utils";

type Props = {
  /** 최상위 그룹 (그룹 코드 선택용) */
  rootGroups: SystemSettingGroup[];
};

const PAGE_SIZE = 10;
const COLUMNS = [
  "그룹코드",
  "그룹명",
  "속성키",
  "속성명",
  "변경값",
  "액션",
  "이전값",
  "변경일시",
  "변경자",
];
const FIELD_CLASS =
  "border-input bg-background h-9 rounded-md border px-3 text-[13px] outline-none focus-visible:border-primary";
const ACTION_TONE = {
  I: "bg-mint-soft text-primary",
  U: "bg-[#ffe9a8] text-[#7a5a00]",
  D: "bg-coral-soft text-coral-strong",
} as const;

/** 변경일시 표시 형식: 2026.10.02 19:27:58 (한국 시간) */
const dateTimeFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/**
 * ISO 시각을 "2026.10.02 19:27:58"(한국 시간)로 표시한다.
 * @param {string | null} iso - ISO 시각
 * @returns {string}
 */
const formatDateTime = (iso: string | null) =>
  iso ? dateTimeFormat.format(new Date(iso)).replace(/-/g, ".") : "-";

/**
 * 변경 이력 탭. 조회 일자(기본 오늘)·그룹 코드·속성키로 검색하고, 10건씩 페이지로 본다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SettingHistoryPanel({ rootGroups }: Readonly<Props>) {
  const [query, setQuery] = useState<SystemSettingHistoryQuery>(() => ({
    date: kstToday(),
    groupId: null,
    key: "",
    page: 1,
    pageSize: PAGE_SIZE,
  }));
  const { data, isPending, isError, error } = useSystemSettingHistoriesData(
    query,
    true,
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE)),
    [data?.total],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setQuery((prev) => ({
        ...prev,
        [name]: name === "key" ? value : value || null,
        page: 1,
      }));
    },
    [],
  );
  const handleClearDate = useCallback(
    () => setQuery((prev) => ({ ...prev, date: null, page: 1 })),
    [],
  );
  const handleReset = useCallback(
    () =>
      setQuery({
        date: kstToday(),
        groupId: null,
        key: "",
        page: 1,
        pageSize: PAGE_SIZE,
      }),
    [],
  );
  const handlePage = useCallback(
    (page: number) => setQuery((prev) => ({ ...prev, page })),
    [],
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1.5 text-xs text-[#68746f]">
          조회 일자
          <span className={cn(FIELD_CLASS, "flex w-48 items-center gap-2")}>
            <CalendarDays className="size-4 shrink-0 text-[#89938f]" />
            <input
              id="history-date"
              type="date"
              name="date"
              value={query.date ?? ""}
              onChange={handleChange}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
            {query.date && (
              <button
                type="button"
                onClick={handleClearDate}
                aria-label="조회 일자 지우기"
                className="hover:text-foreground text-[#89938f]"
              >
                <X className="size-3.5" />
              </button>
            )}
          </span>
        </label>
        <label className="grid gap-1.5 text-xs text-[#68746f]">
          그룹 코드 선택
          <select
            id="history-group"
            name="groupId"
            value={query.groupId ?? ""}
            onChange={handleChange}
            className={cn(FIELD_CLASS, "w-48")}
          >
            <option value="">전체</option>
            {rootGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.id}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-xs text-[#68746f]">
          속성키
          <span className={cn(FIELD_CLASS, "flex w-52 items-center gap-2")}>
            <Search className="size-4 shrink-0 text-[#89938f]" />
            <input
              id="history-key"
              type="search"
              name="key"
              value={query.key}
              onChange={handleChange}
              placeholder="속성키 검색"
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </span>
        </label>
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
      </div>

      <p className="text-[13px] text-[#3c4943]">
        변경 이력 검색결과 총 <strong>{data?.total ?? 0}</strong>건
      </p>

      <div className="bg-card overflow-x-auto rounded-lg border">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#f4f6f5] text-[#3c4943]">
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className="border-b px-3 py-2.5 text-center font-bold whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((history) => (
              <tr
                key={history.id}
                className="border-b text-center last:border-b-0"
              >
                <td className="px-3 py-3">{history.groupId}</td>
                <td className="px-3 py-3">{history.groupName ?? "-"}</td>
                <td className="max-w-44 px-3 py-3 font-mono text-xs break-all">
                  {history.key}
                </td>
                <td className="px-3 py-3">{history.name ?? "-"}</td>
                <td className="max-w-56 px-3 py-3 break-all">
                  {history.nowValue ?? ""}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                      ACTION_TONE[history.action],
                    )}
                  >
                    {SETTING_ACTION_LABEL[history.action]}
                  </span>
                </td>
                <td className="max-w-56 px-3 py-3 break-all">
                  {history.prevValue ?? ""}
                </td>
                <td className="px-3 py-3 whitespace-nowrap tabular-nums">
                  {formatDateTime(history.changedAt)}
                </td>
                <td className="px-3 py-3">{history.changedBy ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isPending && !isError && data?.items.length === 0 && (
          <p className="text-muted-foreground p-10 text-center text-sm">
            조건에 맞는 변경 이력이 없습니다.
          </p>
        )}
        {isPending && (
          <p className="text-muted-foreground p-10 text-center text-sm">
            불러오는 중...
          </p>
        )}
        {isError && (
          <p role="alert" className="text-destructive p-10 text-center text-sm">
            {getErrorMessage(error)}
          </p>
        )}
      </div>

      {data && data.total > 0 && (
        <Pagination
          page={query.page}
          totalPages={totalPages}
          onChange={handlePage}
          withArrows
        />
      )}
    </div>
  );
}
