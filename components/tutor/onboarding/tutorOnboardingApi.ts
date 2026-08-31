"use client";

import { clearAuthSession, getAccessToken } from "../../auth/authSession";

export type TutorPersonalDetailsInput = {
  bio: string;
  country_code: string;
  email: string;
  first_name: string;
  last_name: string;
  occupation: string;
  phone_number: string;
  qualifications: string[];
  other_names?: string;
  password?: string;
  confirm_password?: string;
};

export type TutorIdentificationInput = {
  country: "uk" | "nigeria";
  dbs_certificate_number?: string;
  documents: File[];
  employer_share_code?: string;
  id_type: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function saveTutorPersonalDetails(input: TutorPersonalDetailsInput) {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const response = await fetch("/api/tutor/set-up/personal-details", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (response.status === 401) clearAuthSession();
  if (!response.ok) {
    throw new Error(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Personal details could not be saved.",
    );
  }
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("The personal details service returned an invalid response.");
  }
}

export async function saveTutorIdentification(input: TutorIdentificationInput) {
  const token = getAccessToken();
  if (!token) throw new Error("Your session has expired. Please sign in again.");

  const formData = new FormData();
  formData.append("country", input.country);
  formData.append("id_type", input.id_type);
  if (input.employer_share_code) formData.append("employer_share_code", input.employer_share_code);
  if (input.dbs_certificate_number) formData.append("dbs_certificate_number", input.dbs_certificate_number);
  input.documents.forEach((document) => formData.append("documents", document));

  const response = await fetch("/api/tutor/set-up/identification", {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    body: formData,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (response.status === 401) clearAuthSession();
  if (!response.ok) {
    throw new Error(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Identification could not be submitted.",
    );
  }
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("The identification service returned an invalid response.");
  }
}
