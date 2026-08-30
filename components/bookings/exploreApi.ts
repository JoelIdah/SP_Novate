"use client";

import { clearAuthSession, getAccessToken } from "../auth/authSession";

export type StudentCategory = {
  department: string;
  public_id: string;
  subjects: Array<{ subject: string }>;
};

export type TutorApiItem = {
  address?: string;
  average_rating: number;
  distance_km?: number | null;
  name: string;
  occupation: string;
  profile_photo: string;
  public_id: string;
  qualifications: string[];
  rating_count: number;
  subjects: Array<{ department: string; subject: string }>;
};

export type TutorResultsPage = {
  data: TutorApiItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

type TutorQuery = {
  page: number;
  pageSize: number;
  name?: string;
  department?: string;
  subject?: string;
  day?: string;
  minimumRating?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readApiMessage(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;
  return typeof value.message === "string" && value.message.trim()
    ? value.message
    : undefined;
}

class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function requestJson(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as unknown;

  if (response.status === 401) clearAuthSession();
  if (!response.ok) {
    throw new ApiRequestError(
      readApiMessage(payload) ?? "The request could not be completed.",
      response.status,
      isRecord(payload) && typeof payload.code === "number" ? payload.code : undefined,
      isRecord(payload) && typeof payload.error === "string" ? payload.error : undefined,
    );
  }

  return payload;
}

function readSuccessData(payload: unknown, service: string): unknown {
  if (
    !isRecord(payload) ||
    payload.status !== "success" ||
    payload.code !== 200 ||
    !("data" in payload)
  ) {
    throw new Error(`${service} returned an invalid response.`);
  }
  return payload.data;
}

function parseCategories(payload: unknown): StudentCategory[] {
  const data = readSuccessData(payload, "The categories service");
  if (!Array.isArray(data)) {
    throw new Error("The categories service did not return a categories list.");
  }

  for (const category of data) {
    if (
      !isRecord(category) ||
      typeof category.public_id !== "string" ||
      typeof category.department !== "string" ||
      !Array.isArray(category.subjects) ||
      !category.subjects.every(
        (subject) =>
          isRecord(subject) && typeof subject.subject === "string",
      )
    ) {
      throw new Error("The categories service returned invalid category data.");
    }
  }

  return data as StudentCategory[];
}

function parseTutorResults(payload: unknown): TutorResultsPage {
  const data = readSuccessData(payload, "The tutor service");
  if (
    !isRecord(data) ||
    !Array.isArray(data.data) ||
    typeof data.page !== "number" ||
    typeof data.page_size !== "number" ||
    typeof data.total !== "number" ||
    typeof data.total_pages !== "number"
  ) {
    throw new Error("The tutor service returned invalid pagination data.");
  }

  for (const tutor of data.data) {
    if (
      !isRecord(tutor) ||
      typeof tutor.public_id !== "string" ||
      typeof tutor.name !== "string" ||
      typeof tutor.occupation !== "string" ||
      typeof tutor.profile_photo !== "string" ||
      typeof tutor.average_rating !== "number" ||
      typeof tutor.rating_count !== "number" ||
      !Array.isArray(tutor.qualifications) ||
      !tutor.qualifications.every((item) => typeof item === "string") ||
      !Array.isArray(tutor.subjects) ||
      !tutor.subjects.every(
        (item) =>
          isRecord(item) &&
          typeof item.department === "string" &&
          typeof item.subject === "string",
      ) ||
      (tutor.address !== undefined && typeof tutor.address !== "string") ||
      (tutor.distance_km !== undefined &&
        tutor.distance_km !== null &&
        typeof tutor.distance_km !== "number")
    ) {
      throw new Error("The tutor service returned invalid tutor data.");
    }
  }

  return data as TutorResultsPage;
}

export async function getCategories(signal?: AbortSignal) {
  return parseCategories(await requestJson("/api/categories", { signal }));
}

export async function getTutors(query: TutorQuery, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(query.page),
    page_size: String(query.pageSize),
  });
  const isSearch = Boolean(query.name);

  if (query.name) {
    params.set("name", query.name);
  } else {
    if (query.department) params.set("department", query.department);
    if (query.subject) params.set("subject", query.subject);
    if (query.day) params.append("days", query.day.toLowerCase());
    if (query.minimumRating) params.set("min_rating", query.minimumRating);
  }

  const path = isSearch
    ? "/api/student/explore/search"
    : "/api/student/explore";
  return parseTutorResults(
    await requestJson(`${path}?${params.toString()}`, { signal }),
  );
}

export function isLocationRequiredError(error: unknown) {
  return error instanceof ApiRequestError &&
    error.status === 400 &&
    error.code === 400 &&
    (error.message.trim().toLowerCase() === "please set up your location" ||
      error.detail?.trim().toLowerCase() === "location data needed to get tutor around you");
}

export function isServiceUnavailableError(error: unknown) {
  return error instanceof ApiRequestError &&
    error.status >= 500;
}

export async function updateCurrentLocation(location: {
  accuracy: number;
  latitude: number;
  longitude: number;
}) {
  const payload = await requestJson("/api/user/locations/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...location, source: "gps" }),
  });
  readSuccessData(payload, "The location service");
}
