"use client";

import { isRecord, requestJson } from "../auth/request";

export type TutorBookingStatus = "pending" | "awaiting_approval" | "ongoing" | "completed" | "rejected";

export type TutorBooking = {
  date: string;
  department: string;
  duration: string;
  public_id: string;
  status: TutorBookingStatus;
  student_name: string;
  subject: string;
  time: string;
};

export type TutorBookingPage = {
  data: TutorBooking[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type TutorBookingDetails = {
  student: {
    address: string;
    bio: string;
    distance_km: number;
    name: string;
    profile_photo: string;
    rating: number;
  };
  summary: {
    availability: string[];
    department: string;
    hours_per_day: number;
    number_of_weeks: number;
    payment_option: string;
    period: string;
    session_type: string;
    tutor_fee: number;
  };
  timeline: Array<{ date?: string; label: string; reached: boolean; time?: string }>;
};

function responseData(payload: unknown, service: string) {
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !("data" in payload)) {
    throw new Error(`${service} returned invalid data.`);
  }
  return payload.data;
}

export async function getTutorBookings(query: { date?: string; page: number; pageSize: number; status?: TutorBookingStatus }, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(query.pageSize) });
  if (query.status) params.set("status", query.status);
  if (query.date) params.set("date", query.date);
  return responseData(await requestJson(`/api/tutor/bookings?${params}`, { signal }), "The tutor bookings service") as TutorBookingPage;
}

export async function getTutorBooking(bookingId: string, signal?: AbortSignal) {
  return responseData(await requestJson(`/api/tutor/bookings/${encodeURIComponent(bookingId)}`, { signal }), "The tutor booking service") as TutorBookingDetails;
}

export async function acceptTutorBooking(bookingId: string) {
  await requestJson(`/api/tutor/bookings/${encodeURIComponent(bookingId)}/accept`, { method: "POST" });
}

export async function declineTutorBooking(bookingId: string, reason?: string) {
  await requestJson(`/api/tutor/bookings/${encodeURIComponent(bookingId)}/decline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
  });
}
