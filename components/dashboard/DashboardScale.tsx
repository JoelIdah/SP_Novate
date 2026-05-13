"use client";

import { useEffect } from "react";

const DASHBOARD_SCALE_OVERRIDES: Record<string, string> = {
  "--scale-start-width": "1600px",
  "--scale-growth-per-px": "0.0075",
  "--scale-max-font": "60px",
};

export function DashboardScale() {
  useEffect(() => {
    const root = document.documentElement;
    const previousValues: Record<string, string> = {};
    const previousFontSize = root.style.fontSize;

    Object.entries(DASHBOARD_SCALE_OVERRIDES).forEach(([key, value]) => {
      previousValues[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    });

    const content = document.querySelector<HTMLElement>("[data-dashboard-content]");
    const header = document.querySelector<HTMLElement>(".dashboard-header");
    const main = document.querySelector<HTMLElement>(".dashboard-main");
    if (!content || !main) return;

    let frameId: number | null = null;
    let destroyed = false;
    let previousAppliedFont = Number.NaN;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const applyScale = () => {
      if (destroyed) return;

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const styles = getComputedStyle(root);
        const baseFont = parseFloat(styles.getPropertyValue("--scale-base-font")) || 16;
        const startWidth = parseFloat(styles.getPropertyValue("--scale-start-width")) || 1440;
        const growth = parseFloat(styles.getPropertyValue("--scale-growth-per-px")) || 0.0075;
        const maxFont = parseFloat(styles.getPropertyValue("--scale-max-font")) || 30;

        const width = window.innerWidth;
        const widthFont = Math.min(
          maxFont,
          Math.max(baseFont, baseFont + Math.max(0, width - startWidth) * growth)
        );

        // Normalize measurement at width-driven baseline so we can apply one
        // predictable fit ratio for the full dashboard.
        root.style.fontSize = `${widthFont.toFixed(2)}px`;

        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const mainStyles = getComputedStyle(main);
        const padTop = parseFloat(mainStyles.paddingTop) || 0;
        const padBottom = parseFloat(mainStyles.paddingBottom) || 0;
        const availableHeight = window.innerHeight - headerHeight - padTop - padBottom;
        const contentHeight = content.scrollHeight || 0;

        const fitRatio = contentHeight > 0 ? availableHeight / contentHeight : 1;
        // Keep a tiny buffer to avoid sub-pixel clipping at the bottom.
        const bufferedFitRatio = fitRatio * 0.995;
        // Allow both shrink and grow so short/tall screens can fit with no scroll.
        const fitScale = clamp(bufferedFitRatio, 0.72, 1.6);
        const minFont = Math.max(12, baseFont * 0.75);
        const nextFont = clamp(widthFont * fitScale, minFont, maxFont);

        if (Math.abs(nextFont - previousAppliedFont) > 0.02) {
          previousAppliedFont = nextFont;
          root.style.fontSize = `${nextFont.toFixed(2)}px`;
        }
      });
    };

    applyScale();

    const observer = new ResizeObserver(applyScale);
    observer.observe(content);
    observer.observe(main);
    if (header) observer.observe(header);

    window.addEventListener("resize", applyScale);
    window.addEventListener("load", applyScale);
    void document.fonts?.ready?.then(() => applyScale());

    return () => {
      destroyed = true;
      window.removeEventListener("resize", applyScale);
      window.removeEventListener("load", applyScale);
      observer.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }

      if (previousFontSize) {
        root.style.fontSize = previousFontSize;
      } else {
        root.style.removeProperty("font-size");
      }

      Object.keys(DASHBOARD_SCALE_OVERRIDES).forEach((key) => {
        const previousValue = previousValues[key];
        if (previousValue) {
          root.style.setProperty(key, previousValue);
        } else {
          root.style.removeProperty(key);
        }
      });
    };
  }, []);

  return null;
}
