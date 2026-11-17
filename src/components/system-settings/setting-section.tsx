import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SystemSetting } from "@/lib/backend/types";
import { cn } from "@/lib/utils";
import SettingRow from "./setting-row";

type Props = {
  name: string;
  settings: SystemSetting[];
  drafts: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
  onRevert: (key: string) => void;
  onEdit: (setting: SystemSetting) => void;
  onDelete: (setting: SystemSetting) => void;
  disabled?: boolean;
};

/**
 * 하위 그룹 하나의 접는 구역. 머리에 그룹명과 설정 수를 보여준다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function SettingSection({
  name,
  settings,
  drafts,
  onValueChange,
  onRevert,
  onEdit,
  onDelete,
  disabled,
}: Readonly<Props>) {
  const [open, setOpen] = useState(true);
  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <section className="bg-card relative overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 bg-[#f4f6f5] px-4 py-3 text-left text-[13px] font-bold text-[#2f3b36]"
      >
        <ChevronDown
          className={cn("size-4 transition-transform", !open && "-rotate-90")}
        />
        {name}
        <span className="font-normal text-[#7b8984]">({settings.length})</span>
      </button>
      {open &&
        settings.map((setting) => (
          <SettingRow
            key={setting.key}
            setting={setting}
            draft={drafts[setting.key]}
            onValueChange={onValueChange}
            onRevert={onRevert}
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={disabled}
          />
        ))}
    </section>
  );
}
