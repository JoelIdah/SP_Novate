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
    user?: {
      role?: "student" | "tutor";
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_photo?: string;
      public_id?: string;
      is_profile_setup?: boolean;
    };
  };
};

export async function signInWithProvider({ provider, token }: SocialAuthPayload): Promise<SocialAuthResult> {
  let response: Response;

  try {
    response = await fetch("/api/auth/social", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ provider, token }),
    });
  } catch {
    return {
      kind: "error",
      message: "Could not reach social auth service. Please try again.",
      status: 0,
    };
  }

  const raw = await response.text();
  let data: SocialAuthResponseBody | null = null;

  if (raw) {
    try {
      data = JSON.parse(raw) as SocialAuthResponseBody;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    return {
      kind: "error",
      message: data?.message ?? "Social authentication failed. Please try again.",
      status: response.status,
    };
  }

  if (typeof data?.data?.profile_setup_required !== "boolean") {
    return {
      kind: "error",
      message: "The authentication service did not return the profile setup status.",
      status: 502,
    };
  }

  if (data.data.profile_setup_required) {
    return {
      kind: "success",
      message: data?.message ?? "Profile setup is required.",
      user: data?.data?.user,
      profileSetupRequired: true,
    };
  }

  return {
    kind: "success",
    message: data?.message ?? "Authentication successful.",
    user: data?.data?.user,
    profileSetupRequired: false,
  };
}

