import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateNewOption } from "@/lib/system-settings";

type Props = {
  options: string[];
  onChange: (options: string[]) => void;
  id?: string;
};

/**
 * Radio·Select·Checkbox 유형의 선택지 편집. 입력 후 추가(또는 Enter)로 하나씩 넣고, ×로 뺀다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function OptionListEditor({
  options,
  onChange,
  id,
}: Readonly<Props>) {
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);
  const error = useMemo(
    () => (touched ? validateNewOption(options, draft) : null),
    [draft, options, touched],
  );

  const handleDraft = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);
    setTouched(false);
  }, []);
  const handleAdd = useCallback(() => {
    setTouched(true);
    if (validateNewOption(options, draft)) return;
    onChange([...options, draft.trim()]);
    setDraft("");
    setTouched(false);
  }, [draft, onChange, options]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // 창 전체가 제출되지 않도록 Enter는 선택지 추가로만 쓴다.
      if (event.key !== "Enter") return;
      event.preventDefault();
      handleAdd();
    },
    [handleAdd],
  );
  const handleRemove = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      onChange(
        options.filter((option) => option !== event.currentTarget.value),
      ),
    [onChange, options],
  );

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={handleDraft}
          onKeyDown={handleKeyDown}
          placeholder="선택지 입력"
          aria-label="추가할 선택지"
          className="border-input bg-background focus-visible:border-primary h-9 min-w-0 flex-1 rounded-md border px-3 text-[13px] outline-none"
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus />
          추가
        </Button>
      </div>
      {error && <p className="text-destructive text-[11px]">{error}</p>}
      {options.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="선택지 목록">
          {options.map((option) => (
            <li
              key={option}
              className="bg-mint-soft text-primary flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs font-bold"
            >
              {option}
              <button
                type="button"
                value={option}
                onClick={handleRemove}
                aria-label={`${option} 선택지 삭제`}
                className="hover:bg-primary/10 grid size-5 place-items-center rounded-full"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
