import { AngleLeft, AngleRight } from 'reicon-react';

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-0.5 text-[10px] font-mono tint-text bg-accent/30 border border-border rounded-md px-1.5 py-0.5 shrink-0 select-none h-6">
      <button
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="p-0.5 rounded hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
        title="Halaman sebelumnya"
      >
        <AngleLeft className="h-3 w-3" />
      </button>
      <span className="px-0.5 font-medium">{page}/{pageCount}</span>
      <button
        disabled={page >= pageCount}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        className="p-0.5 rounded hover:text-foreground hover:bg-accent disabled:opacity-20 disabled:hover:text-muted-foreground disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-default"
        title="Halaman berikutnya"
      >
        <AngleRight className="h-3 w-3" />
      </button>
    </div>
  );
}
