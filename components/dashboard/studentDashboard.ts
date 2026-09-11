"use client";

import { isRecord, requestJson } from "../auth/request";

export type StudentDashboardStats = {
  ongoing: number;
  pending: number;
  sessions_completed: number;
  total_booked_sessions: number;
};

export async function getStudentDashboardStats(signal?: AbortSignal) {
  const payload = await requestJson("/api/student/dashboard", { signal });
  const data = isRecord(payload) ? payload.data : null;
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !isRecord(data) ||
      typeof data.ongoing !== "number" || typeof data.pending !== "number" ||
      typeof data.sessions_completed !== "number" || typeof data.total_booked_sessions !== "number") {
    throw new Error("We couldn’t load your dashboard. Please try again.");
  }
  return data as StudentDashboardStats;
}
