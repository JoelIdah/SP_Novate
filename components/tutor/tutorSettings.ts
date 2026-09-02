"use client";

import { isRecord, RequestError, requestJson } from "../auth/request";

export type TutorAccount = {
  email: string;
  first_name: string;
  last_name: string;
  location: { address: string; latitude: number; longitude: number } | null;
  occupation: string;
  phone_number: string;
  profile_photo: string;
  qualifications: string[];
};

export type TutorSubject = {
  availability: Array<{ day: string }>;
  department: string;
  level: string;
  period: number;
  public_id?: string;
  rate_hourly: number;
  session_type: string;
  subject: string;
};

export type TutorSubjectInput = {
  days: string[];
  department: string;
  level: string;
  period: number;
  rate_hourly: number;
  session_type: string;
  subject: string;
};

export type TutorKyc = {
  country: string;
  document_urls: string[];
  id_number: string;
  id_type: string;
  status: string;
};

function dataFrom(payload: unknown, service: string) {
  if (!isRecord(payload) || payload.status !== "success" || !("data" in payload)) {
    throw new Error(`${service} returned invalid data.`);
  }
  return payload.data;
}

function jsonRequest(method: "POST" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export async function getTutorAccount(signal?: AbortSignal) {
  return dataFrom(await requestJson("/api/tutor/settings/account", { signal }), "The tutor account service") as TutorAccount;
}

export async function updateTutorAccount(input: Record<string, unknown>) {
  await requestJson("/api/tutor/settings/account", jsonRequest("PATCH", input));
}

export async function getTutorSubjects(signal?: AbortSignal) {
  return dataFrom(await requestJson("/api/tutor/settings/subjects", { signal }), "The tutor subjects service") as TutorSubject[];
}

export async function createTutorSubject(input: TutorSubjectInput) {
  await requestJson("/api/tutor/settings/subjects", jsonRequest("POST", input));
}

export async function updateTutorSubject(subjectId: string, input: Partial<TutorSubjectInput>) {
  await requestJson(`/api/tutor/settings/subjects/${encodeURIComponent(subjectId)}`, jsonRequest("PATCH", input));
}

export async function getTutorKyc(signal?: AbortSignal) {
  try {
    return dataFrom(await requestJson("/api/tutor/settings/kyc", { signal }), "The tutor KYC service") as TutorKyc;
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) return null;
    throw error;
  }
}

export async function updateTutorKyc(input: { documents: File[]; idNumber: string; idType: string }) {
  const body = new FormData();
  if (input.idType) body.set("id_type", input.idType);
  if (input.idNumber.trim()) body.set("id_number", input.idNumber.trim());
  input.documents.forEach((document) => body.append("documents", document));
  await requestJson("/api/tutor/settings/kyc", { method: "PATCH", body });
}
