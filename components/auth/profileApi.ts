export type AuthenticatedProfile = {
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo: string;
  role: "student" | "tutor";
  phone_number?: string;
  occupation?: string;
  average_rating?: number;
  qualifications?: string[];
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
};

type ProfileResponse = {
  status?: string;
  message?: string;
  data?: unknown;
};

function isAuthenticatedProfile(value: unknown): value is AuthenticatedProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.public_id === "string" &&
    typeof profile.first_name === "string" &&
    typeof profile.last_name === "string" &&
    typeof profile.email === "string" &&
    typeof profile.profile_photo === "string" &&
    (profile.role === "student" || profile.role === "tutor")
  );
}

export async function fetchAuthenticatedProfile(
  token: string,
): Promise<AuthenticatedProfile> {
  const cleanToken = token.trim();
  if (!cleanToken) throw new Error("The authentication token is missing.");

  let response: Response;
  try {
    response = await fetch("/api/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${cleanToken}` },
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not retrieve your profile. Please try again.");
  }

  const result = (await response
    .json()
    .catch(() => null)) as ProfileResponse | null;

  if (response.status === 401) {
    throw new Error("Your sign-in could not be verified. Please sign in again.");
  }
  if (!response.ok) {
    throw new Error(result?.message ?? "Could not retrieve your profile.");
  }
  if (result?.status !== "success" || !isAuthenticatedProfile(result.data)) {
    throw new Error("The profile service returned an invalid response.");
  }

  return result.data;
}
