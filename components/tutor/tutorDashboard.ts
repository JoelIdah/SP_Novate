"use client";

import { isRecord, requestJson } from "../auth/request";

export type TutorDashboardStats = {
  active_students: number;
  completion_rate: number;
  taught_students: number;
  total_booking_requests: number;
  total_resources: number;
  total_subjects: number;
};

const fields: Array<keyof TutorDashboardStats> = [
  "active_students",
  "completion_rate",
  "taught_students",
  "total_booking_requests",
  "total_resources",
  "total_subjects",
];

export async function getTutorDashboard(signal?: AbortSignal) {
  const payload = await requestJson("/api/tutor/dashboard", { signal });
  const data = isRecord(payload) && payload.status === "success" && payload.code === 200 && isRecord(payload.data)
    ? payload.data
    : null;

  if (!data || !fields.every((field) => typeof data[field] === "number")) {
    throw new Error("We couldn’t load your tutor dashboard. Please try again.");
  }

  return data as TutorDashboardStats;
}
