"use client";

import { useEffect, useRef } from "react";

export function InfiniteScrollTrigger({ className = "", enabled, onVisible }: { className?: string; enabled: boolean; onVisible: () => void }) {
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!enabled || !trigger) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onVisible();
    }, { rootMargin: "180px" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, onVisible]);

  return <div aria-hidden className={`h-px ${className}`} ref={triggerRef} />;
}
