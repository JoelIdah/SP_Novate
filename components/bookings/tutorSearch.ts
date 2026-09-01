"use client";

import { isRecord, RequestError, requestJson } from "../auth/request";

export type StudentCategory = {
  department: string;
  public_id: string;
  subjects: Array<{ subject: string }>;
};

export type TutorSearchResult = {
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
  data: TutorSearchResult[];
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
  return error instanceof RequestError &&
    error.status === 400 &&
    error.code === 400 &&
    (error.message.trim().toLowerCase() === "please set up your location" ||
      error.detail?.trim().toLowerCase() === "location data needed to get tutor around you");
}

export function isServiceUnavailableError(error: unknown) {
  return error instanceof RequestError &&
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
