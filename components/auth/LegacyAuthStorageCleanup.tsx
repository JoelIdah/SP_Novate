"use client";

import { useEffect } from "react";

import { clearLegacyAuthTokens } from "./authSession";

export function LegacyAuthStorageCleanup() {
  useEffect(() => {
    clearLegacyAuthTokens();
  }, []);

  return null;
}
