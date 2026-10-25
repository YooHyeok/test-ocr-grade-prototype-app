type Props = {
  columns: string[];
  className?: string;
};

/**
 * 목록 표 공통 헤더 행.
 * @param {Props} props
 * @returns {JSX.Element}
 */
export default function TableHead({ columns, className }: Readonly<Props>) {
  return (
    <thead className={className}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={`${column}-${index}`}
            className="border-b border-[#eef0ee] bg-[#fbfcfa] px-4 py-3.5 text-left text-[11px] font-semibold tracking-[.2px] text-[#86918d]"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}
