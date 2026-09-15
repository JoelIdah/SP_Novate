"use client";

import { isRecord, requestJson } from "../auth/request";

export type TransactionStats = {
  total_finders_fee?: number;
  total_service_fee?: number;
  total_session_fee: number;
  total_successful_transactions: number;
  total_volume: number;
};

export type Transaction = {
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
  tx_type: string;
};

export type TransactionPage = {
  data: Transaction[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type TransactionDetails = {
  estimate: { finders_fee: number; payment_status: string; subtotal: number; total: number; tutor_fee: number; vat: number; vat_percent: number; weekly_rate: number };
  summary: { availability: string[]; department: string; hours_per_day: number; number_of_weeks: number; payment_option: string; period: string; session_type: string; tutor_fee: number };
};

function hasNumbers(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "number");
}

async function request(path: string, signal?: AbortSignal) {
  const payload = await requestJson(path, { signal });
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !("data" in payload)) {
    throw new Error("We couldn’t load your transactions. Please try again.");
  }
  return payload.data;
}

export type TransactionRole = "student" | "tutor";

export async function getTransactionStats(role: TransactionRole, signal?: AbortSignal) {
  const data = await request(`/api/${role}/transactions/stats`, signal);
  const roleFee = role === "tutor" ? "total_service_fee" : "total_finders_fee";
  if (!isRecord(data) || !hasNumbers(data, [roleFee, "total_session_fee", "total_successful_transactions", "total_volume"])) {
    throw new Error("We couldn’t load your transaction summary. Please try again.");
  }
  return data as TransactionStats;
}

export async function getTransactions(role: TransactionRole, query: { date?: string; page: number; pageSize: number; status?: string }, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(query.page), page_size: String(query.pageSize) });
  if (query.date) params.set("date", query.date);
  if (query.status) params.set("status", query.status);
  const data = await request(`/api/${role}/transactions?${params.toString()}`, signal);
  if (!isRecord(data) || !Array.isArray(data.data) || !hasNumbers(data, ["page", "page_size", "total", "total_pages"]) ||
      !data.data.every((item) => isRecord(item) && typeof item.amount === "number" && typeof item.date === "string" &&
        typeof item.method === "string" && typeof item.reference === "string" && typeof item.status === "string" && typeof item.tx_type === "string")) {
    throw new Error("We couldn’t load your transactions. Please try again.");
  }
  return data as TransactionPage;
}

export async function getTransactionDetails(role: TransactionRole, reference: string, signal?: AbortSignal) {
  const data = await request(`/api/${role}/transactions/${encodeURIComponent(reference)}`, signal);
  const estimate = isRecord(data) && isRecord(data.estimate) ? data.estimate : null;
  const summary = isRecord(data) && isRecord(data.summary) ? data.summary : null;
  if (!estimate || !summary ||
      !hasNumbers(estimate, ["finders_fee", "subtotal", "total", "tutor_fee", "vat", "vat_percent", "weekly_rate"]) ||
      typeof estimate.payment_status !== "string" || !Array.isArray(summary.availability) ||
      !summary.availability.every((day) => typeof day === "string") ||
      !hasNumbers(summary, ["hours_per_day", "number_of_weeks", "tutor_fee"]) ||
      !["department", "payment_option", "period", "session_type"].every((key) => typeof summary[key] === "string")) {
    throw new Error("We couldn’t load this transaction. Please try again.");
  }
  return data as TransactionDetails;
}
