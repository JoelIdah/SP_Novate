"use client";

import { isRecord, requestJson } from "../auth/request";

export type StudentProfileUpdate = Partial<{
  bio: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone_number: string;
}>;

export async function updateStudentProfile(input: StudentProfileUpdate) {
  const payload = await requestJson("/api/student/profile/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!isRecord(payload) || payload.status !== "success" || payload.code !== 200) {
    throw new Error("We couldn’t update your profile. Please try again.");
  }
}
