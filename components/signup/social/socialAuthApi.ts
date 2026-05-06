import type { SocialAuthResult, SocialProvider } from "./types";

type SocialAuthPayload = {
  provider: SocialProvider;
  token: string;
};

type SocialAuthResponseBody = {
  message?: string;
  data?: {
    profile_setup_required?: boolean;
    token?: string;
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function socialAuthApi({ provider, token }: SocialAuthPayload): Promise<SocialAuthResult> {
  if (!API_BASE_URL) {
    return {
      kind: "error",
      message: "NEXT_PUBLIC_API_BASE_URL is not configured.",
      status: 500,
    };
  }

  const response = await fetch(`${API_BASE_URL}/v1/auth/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider, token }),
  });

  const raw = await response.text();
  let data: SocialAuthResponseBody | null = null;

  if (raw) {
    try {
      data = JSON.parse(raw) as SocialAuthResponseBody;
    } catch {
      data = null;
    }
  }

  if (response.status === 403) {
    return {
      kind: "success",
      message: data?.message ?? "Profile setup is required.",
      token: data?.data?.token,
      profileSetupRequired: true,
    };
  }

  if (!response.ok) {
    return {
      kind: "error",
      message: data?.message ?? "Social authentication failed. Please try again.",
      status: response.status,
    };
  }

  return {
    kind: "success",
    message: data?.message ?? "Authentication successful.",
    token: data?.data?.token,
    profileSetupRequired: false,
  };
}
