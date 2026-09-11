"use client";

import { isRecord, requestJson } from "../auth/request";

export type TutorSubject = {
  availability: Array<{ day: string }>;
  department: string;
  level: string;
  period: number;
  rate_hourly: number;
  session_type: string;
  subject: string;
};

export type TutorProfile = {
  address: string;
  average_rating: number;
  bio: string;
  distance_km?: number | null;
  name: string;
  occupation: string;
  profile_photo: string;
  public_id: string;
  qualifications: string[];
  rating_count: number;
  subjects: TutorSubject[];
};

export type TutorRating = {
  created_at: string;
  message: string;
  rating: number;
  student_name: string;
  student_photo: string;
};

export type TutorResource = {
  title: string;
  type: "docs" | "link" | "video";
};

export type TutorResources = {
  docs: TutorResource[];
  link: TutorResource[];
  video: TutorResource[];
};

function readSuccessData(payload: unknown, errorMessage: string) {
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200 || !("data" in payload)) {
    throw new Error(errorMessage);
  }
  return payload.data;
}

function isTutorSubject(value: unknown): value is TutorSubject {
  return isRecord(value) &&
    typeof value.department === "string" &&
    typeof value.subject === "string" &&
    typeof value.level === "string" &&
    typeof value.period === "number" &&
    typeof value.rate_hourly === "number" &&
    typeof value.session_type === "string" &&
    Array.isArray(value.availability) &&
    value.availability.every((entry) => isRecord(entry) && typeof entry.day === "string");
}

function parseProfile(payload: unknown): TutorProfile {
  const data = readSuccessData(payload, "We couldn’t load this tutor profile. Please try again.");
  if (!isRecord(data) ||
    typeof data.public_id !== "string" ||
    typeof data.name !== "string" ||
    typeof data.occupation !== "string" ||
    typeof data.profile_photo !== "string" ||
    typeof data.address !== "string" ||
    typeof data.bio !== "string" ||
    typeof data.average_rating !== "number" ||
    typeof data.rating_count !== "number" ||
    !Array.isArray(data.qualifications) ||
    !data.qualifications.every((item) => typeof item === "string") ||
    !Array.isArray(data.subjects) ||
    !data.subjects.every(isTutorSubject) ||
    (data.distance_km !== undefined && data.distance_km !== null && typeof data.distance_km !== "number")) {
    throw new Error("We couldn’t load this tutor profile. Please try again.");
  }
  return data as TutorProfile;
}

function parseRatings(payload: unknown): TutorRating[] {
  const data = readSuccessData(payload, "We couldn’t load tutor ratings. Please try again.");
  if (!Array.isArray(data) || !data.every((rating) =>
    isRecord(rating) &&
    typeof rating.created_at === "string" &&
    typeof rating.message === "string" &&
    typeof rating.rating === "number" &&
    typeof rating.student_name === "string" &&
    typeof rating.student_photo === "string")) {
    throw new Error("We couldn’t load tutor ratings. Please try again.");
  }
  return data as TutorRating[];
}

function isResource(value: unknown): value is TutorResource {
  return isRecord(value) && typeof value.title === "string" &&
    (value.type === "docs" || value.type === "link" || value.type === "video");
}

function parseResources(payload: unknown): TutorResources {
  const data = readSuccessData(payload, "We couldn’t load tutor resources. Please try again.");
  if (!isRecord(data) ||
    !Array.isArray(data.docs) || !data.docs.every(isResource) ||
    !Array.isArray(data.link) || !data.link.every(isResource) ||
    !Array.isArray(data.video) || !data.video.every(isResource)) {
    throw new Error("We couldn’t load tutor resources. Please try again.");
  }
  return data as TutorResources;
}

export async function getTutorProfile(tutorId: string, signal?: AbortSignal) {
  return parseProfile(await requestJson(`/api/student/tutors/${encodeURIComponent(tutorId)}`, { signal }));
}

export async function getTutorRatings(tutorId: string, signal?: AbortSignal) {
  return parseRatings(await requestJson(`/api/student/tutors/${encodeURIComponent(tutorId)}/ratings`, { signal }));
}

export async function getTutorResources(tutorId: string, signal?: AbortSignal) {
  return parseResources(await requestJson(`/api/student/tutors/${encodeURIComponent(tutorId)}/resources`, { signal }));
}
