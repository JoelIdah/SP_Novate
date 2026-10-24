"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

export type SelectMenuOption = { icon?: ReactNode; label: string; value: string };

type SelectMenuProps = {
  ariaLabel?: string;
  buttonClassName?: string;
  className?: string;
  clearable?: boolean;
  disabled?: boolean;
  indicatorClassName?: string;
  inlineMenu?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: readonly SelectMenuOption[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value: string;
};

export function SelectMenu({
  ariaLabel,
  buttonClassName = "",
  className = "",
  clearable = false,
  disabled = false,
  indicatorClassName = "",
  inlineMenu = false,
  invalid = false,
  onBlur,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder = "Search options",
  value,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [opensUpward, setOpensUpward] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const selected = options.find((option) => option.value === value);
  const filteredOptions = searchQuery.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : options;

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      (searchable ? inputRef.current : triggerRef.current)?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, searchable]);

  const openMenu = () => {
    if (disabled) return;
    setSearchQuery("");
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect && !inlineMenu)
      setOpensUpward(
        window.innerHeight - rect.bottom < 280 &&
          rect.top > window.innerHeight - rect.bottom,
      );
    setOpen(true);
  };

  const moveOptionFocus = (direction: 1 | -1) => {
    const optionButtons = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-select-option]",
      ) ?? [],
    );
    if (!optionButtons.length) return;
    const currentIndex = optionButtons.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
    const startIndex =
      currentIndex >= 0 ? currentIndex : Math.max(selectedIndex, 0);
    optionButtons[
      (startIndex + direction + optionButtons.length) % optionButtons.length
    ]?.focus();
  };

  return (
    <div
      className={`relative ${className}`}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        if (!open) {
          openMenu();
          window.requestAnimationFrame(() =>
            moveOptionFocus(event.key === "ArrowDown" ? 1 : -1),
          );
        } else moveOptionFocus(event.key === "ArrowDown" ? 1 : -1);
      }}
      ref={rootRef}
    >
      {searchable ? (
        <div className={`flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-3.5 text-sm font-medium shadow-[0_1px_2px_rgba(25,32,56,0.04)] transition focus-within:ring-2 focus-within:ring-[#6d63ee]/15 ${disabled ? "cursor-not-allowed bg-[#f1f3f7] text-[#a4aabc]" : ""} ${invalid ? "border-brand-danger" : open ? "border-[#6d63ee]" : "border-[#d8dde8] hover:border-[#bfc5d3]"} ${buttonClassName}`}>
          <Search className="h-4 w-4 shrink-0 text-[#8d94a6]" />
          <input
            aria-autocomplete="list"
            aria-controls={menuId}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            className="min-w-0 flex-1 bg-transparent text-[inherit] font-[inherit] text-[#46506a] outline-none placeholder:text-[#9299a9] disabled:cursor-not-allowed"
            disabled={disabled}
            onBlur={onBlur}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              if (!open) openMenu();
            }}
            onFocus={() => {
              if (!open) openMenu();
            }}
            placeholder={open ? searchPlaceholder : placeholder}
            ref={inputRef}
            role="combobox"
            value={open ? searchQuery : selected?.label ?? ""}
          />
          {clearable && value ? (
            <button
              aria-label={`Clear ${ariaLabel ?? "selection"}`}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8a92a6] hover:bg-[#f0f1f5] hover:text-[#4f586f]"
              onClick={() => {
                onChange("");
                setSearchQuery("");
                setOpen(true);
                window.requestAnimationFrame(() => inputRef.current?.focus());
              }}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            aria-label={open ? "Close options" : "Open options"}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f0f1ff] text-[#5652d2] ${indicatorClassName}`}
            disabled={disabled}
            onClick={() => {
              if (open) {
                setOpen(false);
                inputRef.current?.focus();
              } else {
                openMenu();
                window.requestAnimationFrame(() => inputRef.current?.focus());
              }
            }}
            onMouseDown={(event) => event.preventDefault()}
            tabIndex={-1}
            type="button"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      ) : (
        <button
          aria-controls={menuId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          className={`flex h-11 w-full items-center justify-between gap-3 rounded-lg border bg-white px-3.5 text-left text-sm font-medium shadow-[0_1px_2px_rgba(25,32,56,0.04)] outline-none transition focus:border-[#6d63ee] focus:ring-2 focus:ring-[#6d63ee]/15 disabled:cursor-not-allowed disabled:bg-[#f1f3f7] disabled:text-[#a4aabc] ${invalid ? "border-brand-danger" : open ? "border-[#6d63ee]" : "border-[#d8dde8] hover:border-[#bfc5d3]"} ${buttonClassName}`}
          disabled={disabled}
          onBlur={onBlur}
          onClick={() => (open ? setOpen(false) : openMenu())}
          ref={triggerRef}
          type="button"
        >
          <span className={`flex min-w-0 flex-1 items-center gap-2 ${selected ? "text-[#46506a]" : "text-[#9299a9]"}`}>
            {selected?.icon}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#f0f1ff] text-[#5652d2] ${indicatorClassName}`}>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      )}

      {open ? (
        <div
          className={`${inlineMenu ? "relative mt-1.5" : `absolute left-0 ${opensUpward ? "bottom-[calc(100%+0.45rem)]" : "top-[calc(100%+0.45rem)]"}`} z-[90] w-full min-w-[12rem] overflow-hidden rounded-xl border border-[#dfe3ec] bg-white p-1.5 shadow-[0_18px_42px_rgba(23,30,58,0.16)]`}
          id={menuId}
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto overscroll-contain py-0.5">
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  aria-selected={isSelected}
                  className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium ${isSelected ? "bg-brand-primary-soft text-brand-accent" : "text-[#596277] hover:bg-[#f5f6fa] hover:text-[#303755]"}`}
                  data-select-option
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setSearchQuery("");
                    setOpen(false);
                    (searchable ? inputRef.current : triggerRef.current)?.focus();
                  }}
                  role="option"
                  type="button"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} />
                  ) : null}
                </button>
              );
            })}
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm font-medium text-[#8d94a6]">
                No matching options
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
