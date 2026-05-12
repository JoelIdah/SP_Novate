"use client";

import { useEffect } from "react";

const DASHBOARD_SCALE_OVERRIDES: Record<string, string> = {
  "--scale-start-width": "1600px",
  "--scale-growth-per-px": "0.0085",
  "--scale-max-font": "40px",
};

export function DashboardScale() {
  useEffect(() => {
    const root = document.documentElement;
    const previousValues: Record<string, string> = {};

    Object.entries(DASHBOARD_SCALE_OVERRIDES).forEach(([key, value]) => {
      previousValues[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    });

    return () => {
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
