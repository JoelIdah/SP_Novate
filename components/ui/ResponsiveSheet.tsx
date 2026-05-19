"use client";

import { useEffect, useRef, useState } from "react";

type ResponsiveSheetProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  mobileOnly?: boolean;
  panelClassName?: string;
  backdropClassName?: string;
};

export default function ResponsiveSheet({
  open,
  onClose,
  children,
  mobileOnly = false,
  panelClassName = "",
  backdropClassName = "",
}: ResponsiveSheetProps) {
  const transitionMs = 300;
  const [mounted, setMounted] = useState(open);
  const [isActive, setIsActive] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRafRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setMounted(true);
      if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
      openRafRef.current = requestAnimationFrame(() => {
        setIsActive(true);
        openRafRef.current = null;
      });
      return;
    }

    setIsActive(false);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, transitionMs);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarCompensation > 0) document.body.style.paddingRight = `${scrollbarCompensation}px`;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [mounted, onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 ${mobileOnly ? "md:hidden" : ""}`} onClick={onClose}>
      <div
        className={`absolute inset-0 bg-[#0f142d]/58 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"} ${backdropClassName}`}
      />
      <div
        ref={panelRef}
        className={`absolute bottom-0 left-0 right-0 z-10 flex max-h-[86svh] flex-col overflow-hidden rounded-t-2xl border-t border-[#d6dce8] bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+10px)] shadow-2xl transition-transform duration-300 ease-out will-change-transform lg:bottom-0 lg:left-auto lg:right-0 lg:top-0 lg:max-h-none lg:h-full lg:w-full lg:max-w-[558px] lg:rounded-l-xl lg:rounded-tr-none lg:border-l lg:border-t-0 lg:px-5 lg:pb-0 ${isActive ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:translate-x-full"} ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
