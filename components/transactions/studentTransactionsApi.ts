"use client";

import { waitForAuthenticationRedirect } from "../auth/authSession";

export type StudentTransactionStats = {
  total_finders_fee: number;
  total_session_fee: number;
  total_successful_transactions: number;
  total_volume: number;
};

export type StudentTransaction = {
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
  tx_type: string;
};

export type StudentTransactionPage = {
  data: StudentTransaction[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type StudentTransactionDetails = {
  estimate: { finders_fee: number; payment_status: string; subtotal: number; total: number; tutor_fee: number; vat: number; vat_percent: number; weekly_rate: number };
  summary: { availability: string[]; department: string; hours_per_day: number; number_of_weeks: number; payment_option: string; period: string; session_type: string; tutor_fee: number };
};

function hasNumbers(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "number");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function request(path: string, signal?: AbortSignal) {
  const response = await fetch(path, { headers: { Accept: "application/json" }, cache: "no-store", signal });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (response.status === 401) return waitForAuthenticationRedirect();
  if (!response.ok) {
    throw new Error(isRecord(payload) && typeof payload.message === "string" ? payload.message : "The request could not be completed.");
  }
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !("data" in payload)) {
    throw new Error("The transaction service returned an invalid response.");
  }
  return payload.data;
}

export async function getStudentTransactionStats(signal?: AbortSignal) {
  const data = await request("/api/student/transactions/stats", signal);
  if (!isRecord(data) || !hasNumbers(data, ["total_finders_fee", "total_session_fee", "total_successful_transactions", "total_volume"])) {
    throw new Error("The transaction statistics service returned invalid data.");
  }
  return data as StudentTransactionStats;
}

export async function getStudentTransactions(query: { date?: string; page: number; pageSize: number; status?: string }, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(query.pageSize) });
  if (query.date) params.set("date", query.date);
  if (query.status) params.set("status", query.status);
  const data = await request(`/api/student/transactions?${params.toString()}`, signal);
  if (!isRecord(data) || !Array.isArray(data.data) || !hasNumbers(data, ["page", "page_size", "total", "total_pages"]) ||
      !data.data.every((item) => isRecord(item) && typeof item.amount === "number" && typeof item.date === "string" &&
        typeof item.method === "string" && typeof item.reference === "string" && typeof item.status === "string" && typeof item.tx_type === "string")) {
    throw new Error("The transactions service returned invalid data.");
  }
  return data as StudentTransactionPage;
}

export async function getStudentTransactionDetails(reference: string, signal?: AbortSignal) {
  const data = await request(`/api/student/transactions/${encodeURIComponent(reference)}`, signal);
  const estimate = isRecord(data) && isRecord(data.estimate) ? data.estimate : null;
  const summary = isRecord(data) && isRecord(data.summary) ? data.summary : null;
  if (!estimate || !summary ||
      !hasNumbers(estimate, ["finders_fee", "subtotal", "total", "tutor_fee", "vat", "vat_percent", "weekly_rate"]) ||
      typeof estimate.payment_status !== "string" || !Array.isArray(summary.availability) ||
      !summary.availability.every((day) => typeof day === "string") ||
      !hasNumbers(summary, ["hours_per_day", "number_of_weeks", "tutor_fee"]) ||
      !["department", "payment_option", "period", "session_type"].every((key) => typeof summary[key] === "string")) {
    throw new Error("The transaction details service returned invalid data.");
  }
  return data as StudentTransactionDetails;
}
