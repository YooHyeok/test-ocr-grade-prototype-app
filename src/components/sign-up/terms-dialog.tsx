import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TermsBlock, TermsDoc } from "@/lib/terms";

type Props = {
  /** 보여줄 약관. null이면 닫힌 상태 */
  doc: TermsDoc | null;
  /** 이미 동의한 약관인지 (버튼 문구) */
  agreed: boolean;
  onAgree: (doc: TermsDoc) => void;
  onClose: () => void;
};

/**
 * 약관 블록 하나를 그린다.
 * @param {{ block: TermsBlock }} props
 * @returns {JSX.Element}
 */
function TermsBlockView({ block }: Readonly<{ block: TermsBlock }>) {
  switch (block.type) {
    case "heading":
      return (
        <h3 className="text-foreground mt-4.5 mb-1.5 text-sm font-bold">
          {block.text}
        </h3>
      );
    case "paragraph":
      return <p className="mb-2">{block.text}</p>;
    case "list":
      return (
        <ol className="mb-2 list-decimal pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <table className="my-2.5 w-full border-collapse text-xs">
          <thead>
            <tr>
              {block.head.map((cell) => (
                <th
                  key={cell}
                  className="text-foreground border bg-[#f4f6f5] px-2.5 py-2 text-left whitespace-nowrap first:w-[26%] last:w-[24%]"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell} className="border px-2.5 py-2 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

/**
 * 약관 전문 창. 동의를 누르면 해당 약관에 체크된다. 닫기·바깥 클릭·Esc는 체크 없이 닫는다.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function TermsDialog({
  doc,
  agreed,
  onAgree,
  onClose,
}: Readonly<Props>) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onClose();
    },
    [onClose],
  );
  const handleAgree = useCallback(() => {
    if (doc) onAgree(doc);
  }, [doc, onAgree]);

  return (
    <Dialog open={doc !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[86vh] flex-col gap-0 p-0 sm:max-w-[640px]">
        <DialogHeader className="border-b px-6 pt-5.5 pb-4">
          <DialogTitle>{doc?.title}</DialogTitle>
          <DialogDescription className="sr-only">
            약관 전문입니다. 동의를 누르면 이 약관에 동의한 것으로 체크됩니다.
          </DialogDescription>
        </DialogHeader>
        {/* 본문만 스크롤 (키보드로도 스크롤할 수 있게 초점을 받는다) */}
        <section
          tabIndex={0}
          aria-label={`${doc?.title ?? "약관"} 본문`}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-[13px] leading-[1.7] break-keep text-[#4f5d57] outline-none"
        >
          <p className="bg-notice text-notice-foreground mb-3 rounded-lg px-3 py-2 text-xs">
            {doc?.meta}
          </p>
          {/* 약관 블록은 순서가 바뀌지 않는 정적 데이터라 순번을 key로 쓴다. */}
          {doc?.blocks.map((block, index) => (
            <TermsBlockView key={`${doc.key}-${index}`} block={block} />
          ))}
        </section>
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={handleAgree}>{agreed ? "동의함 ✓" : "동의"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
