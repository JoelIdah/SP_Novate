"use client";

import { isRecord, requestJson } from "../../auth/request";
import type { TutorStatus } from "../../auth/profile";

export type TutorPersonalDetailsInput = {
  bio: string;
  country_code: string;
  dob: string;
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

export type NigerianBank = { code: string; name: string; slug?: string };

export type TutorReviewDocument = {
  created_at: string;
  document_url: string;
  file_name: string;
  file_type: string;
  purpose: string;
};

export type TutorCompensationInput =
  | { country: "uk"; return_url: string; refresh_url: string }
  | { country: "nigeria"; bank_name: string; bank_code: string; account_number: string };

export type TutorCompensationResult =
  | {
      country: "uk";
      stripe_onboarding_url: string;
      stripe_payouts_enabled: boolean;
    }
  | {
      country: "nigeria";
      account_name: string;
      account_number: string;
      bank_name: string;
    };

export type TutorOnboardingReview = {
  compensation: null | {
    country: string;
    account_number?: string;
    account_name?: string;
    bank_code?: string;
    bank_name?: string;
    stripe_payouts_enabled?: boolean;
  };
  identification: null | {
    country: string;
    id_type: string;
    status: string;
    employer_share_code?: string;
    dbs_certificate_number?: string;
  };
  documents: TutorReviewDocument[];
  is_complete: boolean;
  location: null | {
    accuracy?: number;
    address: string;
    latitude: number;
    longitude: number;
    place_id?: string;
    source: string;
  };
  missing_steps: string[];
  personal_details: null | {
    bio: string;
    dob?: string;
    email: string;
    first_name: string;
    last_name: string;
    occupation: string;
    phone_number: string;
    qualifications: string[];
    other_names?: string;
  };
  tutor_status: TutorStatus;
};

async function onboardingRequest(path: string, init: RequestInit = {}) {
  const payload = await requestJson(path, init);
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("We couldn’t load your tutor application. Please try again.");
  }
  return payload;
}

export async function saveTutorPersonalDetails(input: TutorPersonalDetailsInput) {
  const payload = await requestJson("/api/tutor/set-up/personal-details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("We couldn’t save your personal details. Please try again.");
  }
}

export async function saveTutorIdentification(input: TutorIdentificationInput) {
  const formData = new FormData();
  formData.append("country", input.country);
  formData.append("id_type", input.id_type);
  if (input.employer_share_code) formData.append("employer_share_code", input.employer_share_code);
  if (input.dbs_certificate_number) formData.append("dbs_certificate_number", input.dbs_certificate_number);
  input.documents.forEach((document) => formData.append("documents", document));

  const payload = await requestJson("/api/tutor/set-up/identification", {
    method: "POST",
    body: formData,
  });
  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("We couldn’t save your identification details. Please try again.");
  }
}

export async function getNigerianBanks() {
  const payload = await onboardingRequest("/api/tutor/set-up/compensation/nigeria/banks");
  if (!Array.isArray(payload.data) || !payload.data.every((bank) => isRecord(bank) && typeof bank.code === "string" && typeof bank.name === "string")) {
    throw new Error("We couldn’t load the list of banks. Please try again.");
  }
  return payload.data as NigerianBank[];
}

export async function resolveNigerianBankAccount(accountNumber: string, bankCode: string) {
  const params = new URLSearchParams({ account_number: accountNumber, bank_code: bankCode });
  const payload = await onboardingRequest(`/api/tutor/set-up/compensation/nigeria/resolve-account?${params}`);
  if (!isRecord(payload.data) || typeof payload.data.account_name !== "string" || !payload.data.account_name.trim()) {
    throw new Error("We couldn’t verify this bank account. Check the details and try again.");
  }
  return payload.data.account_name;
}

export async function saveTutorCompensation(input: TutorCompensationInput) {
  const payload = await onboardingRequest("/api/tutor/set-up/compensation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!isRecord(payload.data) || payload.data.country !== input.country) {
    throw new Error("We couldnâ€™t process your compensation details. Please try again.");
  }
  if (
    input.country === "uk" &&
    (typeof payload.data.stripe_onboarding_url !== "string" ||
      !payload.data.stripe_onboarding_url)
  ) {
    throw new Error("We couldnâ€™t start Stripe onboarding. Please try again.");
  }
  return payload.data as TutorCompensationResult;
}

export async function getTutorOnboardingReview(signal?: AbortSignal) {
  const payload = await onboardingRequest("/api/tutor/set-up/review", { signal });
  const data = payload.data;
  if (!isRecord(data)) {
    throw new Error("We couldn’t load your application review. Please try again.");
  }
  return {
    ...data,
    documents: Array.isArray(data.documents) ? data.documents : [],
    missing_steps: Array.isArray(data.missing_steps) ? data.missing_steps : [],
  } as TutorOnboardingReview;
}

export async function submitTutorOnboardingConsent() {
  const payload = await onboardingRequest("/api/tutor/set-up/review/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consent: true }),
  });
  return typeof payload.message === "string" ? payload.message : "Tutor application submitted.";
}

export async function saveTutorLocation(input: Record<string, string | number>) {
  await onboardingRequest("/api/user/locations/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
