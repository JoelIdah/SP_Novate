type PaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function Pagination({ page, totalPages, onPrevious, onNext, className = "" }: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={`flex items-center justify-between gap-3 text-xs text-ui-body ${className}`}>
      <button className="min-h-11 rounded-lg border border-ui-border bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 md:min-h-9" disabled={page <= 1} onClick={onPrevious} type="button">Previous</button>
      <span aria-live="polite" className="whitespace-nowrap">Page {page} of {totalPages}</span>
      <button className="min-h-11 rounded-lg border border-ui-border bg-white px-3 font-medium disabled:cursor-not-allowed disabled:opacity-50 md:min-h-9" disabled={page >= totalPages} onClick={onNext} type="button">Next</button>
    </nav>
  );
}
