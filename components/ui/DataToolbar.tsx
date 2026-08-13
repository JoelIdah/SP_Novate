import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

export function DataToolbar({ placeholder, actions, value, onChange }: { placeholder: string; actions?: ReactNode; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="relative block w-full max-w-sm">
        <span className="sr-only">{placeholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a9bc]" />
        <input
          className="min-h-11 w-full rounded-full border border-ui-border bg-white pl-10 pr-3 text-sm text-[#495167] outline-none placeholder:text-[#adb4c5] focus:border-brand-accent md:min-h-10"
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          placeholder={placeholder}
          type="search"
          value={value}
        />
      </label>
      {actions ?? (
        <button className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-ui-border bg-white px-3 text-xs font-semibold text-ui-body hover:bg-[#f7f8fb] md:min-h-10" type="button">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </button>
      )}
    </div>
  );
}
