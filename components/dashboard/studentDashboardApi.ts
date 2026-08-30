"use client";

import { clearAuthSession, getAccessToken } from "../auth/authSession";

export type StudentDashboardStats = {
  ongoing: number;
  pending: number;
  sessions_completed: number;
  total_booked_sessions: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function getStudentDashboardStats(signal?: AbortSignal) {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  const response = await fetch("/api/student/dashboard", {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal,
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (response.status === 401) clearAuthSession();
  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.message === "string" ? payload.message : "The dashboard could not be loaded.");
  }
  const data = isRecord(payload) ? payload.data : null;
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !isRecord(data) ||
      typeof data.ongoing !== "number" || typeof data.pending !== "number" ||
      typeof data.sessions_completed !== "number" || typeof data.total_booked_sessions !== "number") {
    throw new Error("The dashboard returned an invalid response.");
  }
  return data as StudentDashboardStats;
}
