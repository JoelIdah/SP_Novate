"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";

type ChoiceFilter = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

type TableFiltersProps = {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  filters?: ChoiceFilter[];
  className?: string;
};

function formatDate(value: string) {
  if (!value) return "Any";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function TableFilters({
  dateFrom = "",
  dateTo = "",
  onDateFromChange,
  onDateToChange,
  filters = [],
  className = "",
}: TableFiltersProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasDateFilter = Boolean(onDateFromChange && onDateToChange);
  const dateLabel = dateFrom || dateTo
    ? `${formatDate(dateFrom)} – ${formatDate(dateTo)}`
    : "All dates";

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenFilter(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenFilter(null);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const toggle = (filter: string) => {
    setOpenFilter((current) => current === filter ? null : filter);
  };

  return (
    <div ref={rootRef} className={`flex flex-wrap items-center gap-2 border-b border-[#e7ebf4] pb-3 ${className}`}>
      {hasDateFilter ? (
        <div className="relative">
          <button
            aria-expanded={openFilter === "date"}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ui-border bg-white px-3 text-xs font-semibold text-ui-body transition-colors hover:border-[#cfd5e1] hover:bg-[#f8f9fb] md:min-h-10"
            onClick={() => toggle("date")}
            type="button"
          >
            <CalendarDays className="h-4 w-4 text-[#7b8497]" />
            <span>Date: <span className="text-[#303755]">{dateLabel}</span></span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openFilter === "date" ? "rotate-180" : ""}`} />
          </button>

          {openFilter === "date" ? (
            <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-ui-border bg-white p-3 shadow-[var(--ui-shadow-overlay)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ui-title">Date range</p>
                {dateFrom || dateTo ? (
                  <button className="rounded-md px-1.5 py-1 text-xs font-semibold text-brand-accent" onClick={() => { onDateFromChange?.(""); onDateToChange?.(""); }} type="button">Clear</button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-ui-body">
                  From
                  <input className="mt-1.5 h-11 w-full rounded-lg border border-ui-border bg-white px-2.5 text-sm text-ui-title" max={dateTo || undefined} onChange={(event) => onDateFromChange?.(event.target.value)} type="date" value={dateFrom} />
                </label>
                <label className="block text-xs font-semibold text-ui-body">
                  To
                  <input className="mt-1.5 h-11 w-full rounded-lg border border-ui-border bg-white px-2.5 text-sm text-ui-title" min={dateFrom || undefined} onChange={(event) => onDateToChange?.(event.target.value)} type="date" value={dateTo} />
                </label>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {filters.map((filter) => {
        const key = `choice-${filter.label}`;
        return (
          <div className="relative" key={filter.label}>
            <button
              aria-expanded={openFilter === key}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ui-border bg-white px-3 text-xs font-semibold text-ui-body transition-colors hover:border-[#cfd5e1] hover:bg-[#f8f9fb] md:min-h-10"
              onClick={() => toggle(key)}
              type="button"
            >
              <span>{filter.label}: <span className="text-[#303755]">{filter.value}</span></span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openFilter === key ? "rotate-180" : ""}`} />
            </button>

            {openFilter === key ? (
              <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 min-w-[13rem] rounded-xl border border-ui-border bg-white p-2 shadow-[var(--ui-shadow-overlay)]">
                {filter.options.map((option) => (
                  <button
                    aria-pressed={filter.value === option}
                    className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium ${filter.value === option ? "bg-brand-primary-soft text-brand-accent" : "text-ui-body hover:bg-[#f7f8fb]"}`}
                    key={option}
                    onClick={() => { filter.onChange(option); setOpenFilter(null); }}
                    type="button"
                  >
                    {option}
                    {filter.value === option ? <Check className="h-4 w-4" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
