"use client";

import { clearAuthSession, getAccessToken } from "../auth/authSession";

export type PaymentOption = "full" | "per_session";
export type BookingStatus = "pending" | "awaiting_approval" | "ongoing" | "completed" | "cancelled";

export type BookingInput = {
  days: string[];
  department: string;
  hours_per_day: number;
  number_of_weeks: number;
  payment_option: PaymentOption;
  subject: string;
};

export type BookingEstimate = {
  estimate: {
    amount_due_now: number;
    amount_per_session: number;
    currency: string;
    finders_fee: number;
    subtotal: number;
    total: number;
    tutor_fee: number;
    vat: number;
  };
  summary: {
    availability: string[];
    department: string;
    hours_per_day: number;
    number_of_weeks: number;
    payment_option: PaymentOption;
    session_type: string;
    subject: string;
    tutor_fee: number;
  };
};

export type BookingListItem = {
  date: string;
  department: string;
  duration: string;
  public_id: string;
  status: BookingStatus;
  subject: string;
  time: string;
  tutor_name: string;
};

export type BookingPage = {
  data: BookingListItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type BookingDetails = {
  estimate: {
    finders_fee: number;
    payment_status: "paid" | "pending";
    subtotal: number;
    total: number;
    tutor_fee: number;
    vat: number;
    vat_percent: number;
    weekly_rate: number;
  };
  summary: {
    availability: string[];
    department: string;
    hours_per_day: number;
    number_of_weeks: number;
    payment_option: PaymentOption;
    period: string;
    session_type: string;
    tutor_fee: number;
  };
  timeline: Array<{ date: string; label: string; reached: boolean; time: string }>;
  tutor: {
    address: string;
    distance_km?: number | null;
    name: string;
    occupation: string;
    profile_photo: string;
    qualifications: string[];
    rating: number;
  };
};

export type RatingInput = {
  achieved_goal: "yes" | "partially" | "no";
  explained_clearly: "very_clearly" | "somewhat" | "not_really";
  feedback?: string;
  rating: number;
  was_on_time: "yes" | "no";
  would_recommend: "yes" | "no";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function request(path: string, init: RequestInit = {}) {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (response.status === 401) clearAuthSession();
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === "string" ? payload.message : "The request could not be completed.";
    throw new Error(message);
  }
  return payload;
}

function dataFrom(payload: unknown, expectedCode: number, service: string) {
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== expectedCode || !("data" in payload)) {
    throw new Error(`${service} returned an invalid response.`);
  }
  return payload.data;
}

function jsonPost(body: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export async function estimateBooking(tutorId: string, input: BookingInput) {
  return dataFrom(await request(`/api/student/tutors/${encodeURIComponent(tutorId)}/booking/estimate`, jsonPost(input)), 200, "The booking estimate service") as BookingEstimate;
}

export async function createBooking(tutorId: string, input: BookingInput) {
  return dataFrom(await request(`/api/student/tutors/${encodeURIComponent(tutorId)}/booking`, jsonPost(input)), 201, "The booking service") as { amount_charged: number; checkout_url: string };
}

export async function getBookings(query: { date?: string; page: number; pageSize: number; status?: BookingStatus }, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(query.pageSize) });
  if (query.status) params.set("status", query.status);
  if (query.date) params.set("date", query.date);
  return dataFrom(await request(`/api/student/bookings?${params.toString()}`, { signal }), 200, "The bookings service") as BookingPage;
}

export async function getBookingDetails(bookingId: string, signal?: AbortSignal) {
  return dataFrom(await request(`/api/student/bookings/${encodeURIComponent(bookingId)}`, { signal }), 200, "The booking details service") as BookingDetails;
}

export async function cancelBooking(bookingId: string, reason?: string) {
  await request(`/api/student/bookings/${encodeURIComponent(bookingId)}/cancel`, jsonPost(reason?.trim() ? { reason: reason.trim() } : {}));
}

export async function rateBooking(bookingId: string, input: RatingInput) {
  await request(`/api/student/bookings/${encodeURIComponent(bookingId)}/rate`, jsonPost(input));
}
