"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type DataTableShellProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  onReachEnd?: () => void;
};

/**
 * Shared desktop frame for dashboard data tables.
 *
 * The table follows its content height until it reaches the visible viewport.
 * At that point only the rows region scrolls beneath the sticky table header.
 */
export function DataTableShell({
  children,
  className = "",
  viewportClassName = "",
  onReachEnd,
}: DataTableShellProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [tableViewportHeight, setTableViewportHeight] = useState<number>();

  const measureAvailableHeight = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const visualViewport = window.visualViewport;
    const viewportTop = visualViewport?.offsetTop ?? 0;
    const viewportBottom = viewportTop + (visualViewport?.height ?? window.innerHeight);
    const shellTop = Math.max(shell.getBoundingClientRect().top, viewportTop);
    const bottomBreathingRoom = 20;
    const availableHeight = Math.floor(viewportBottom - shellTop - bottomBreathingRoom);
    const offscreenBootstrapHeight = Math.min(320, Math.max(0, Math.floor((visualViewport?.height ?? window.innerHeight) - bottomBreathingRoom)));
    const nextHeight = shell.getBoundingClientRect().top >= viewportBottom
      ? offscreenBootstrapHeight
      : Math.max(0, availableHeight);

    setTableViewportHeight((current) => current === nextHeight ? current : nextHeight);
  }, []);

  useLayoutEffect(() => {
    measureAvailableHeight();

    const scrollContainer = shellRef.current?.closest(".dashboard-main");
    const resizeObserver = new ResizeObserver(measureAvailableHeight);
    if (shellRef.current) resizeObserver.observe(shellRef.current);

    window.addEventListener("resize", measureAvailableHeight);
    scrollContainer?.addEventListener("scroll", measureAvailableHeight, { passive: true });
    window.visualViewport?.addEventListener("resize", measureAvailableHeight);
    window.visualViewport?.addEventListener("scroll", measureAvailableHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureAvailableHeight);
      scrollContainer?.removeEventListener("scroll", measureAvailableHeight);
      window.visualViewport?.removeEventListener("resize", measureAvailableHeight);
      window.visualViewport?.removeEventListener("scroll", measureAvailableHeight);
    };
  }, [measureAvailableHeight]);

  return (
    <div className={`mb-5 hidden overflow-hidden rounded-xl border border-ui-border bg-white md:block ${className}`} ref={shellRef}>
      <div
        className={`overflow-auto overscroll-contain [scrollbar-gutter:stable] [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 ${viewportClassName}`}
        onScroll={onReachEnd ? (event) => {
          const viewport = event.currentTarget;
          if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 96) onReachEnd();
        } : undefined}
        style={{ maxHeight: tableViewportHeight === undefined ? "55dvh" : `${tableViewportHeight}px` }}
      >
        {children}
      </div>
    </div>
  );
}
