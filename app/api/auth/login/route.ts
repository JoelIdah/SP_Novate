import { NextResponse } from "next/server";

import {
  getBackendUrl,
  isSameOriginMutation,
  setAuthCookie,
  setProfileSetupRequiredCookie,
} from "@/lib/server/authSession";

type BackendAuthResponse = {
  status?: string;
  message?: string;
  code?: number;
  data?: {
    profile_setup_required?: boolean;
    token?: string;
  };
};

async function readJson(response: Response): Promise<BackendAuthResponse | null> {
  return response.json().catch(() => null) as Promise<BackendAuthResponse | null>;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, message: "You don’t have permission to perform this action." },
      { status: 403 },
    );
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { status: "error", code: 500, message: "Sign-in is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { status: "error", code: 400, message: "Invalid login request." },
      { status: 400 },
    );
  }

  try {
    const loginResponse = await fetch(`${backendUrl}/v1/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const loginPayload = await readJson(loginResponse);

    if (!loginResponse.ok) {
      return NextResponse.json(loginPayload ?? {}, { status: loginResponse.status });
    }

    const token = loginPayload?.data?.token?.trim();
    if (!token) {
      return NextResponse.json(
        { status: "error", code: 502, message: "We couldn’t sign you in right now. Please try again." },
        { status: 502 },
      );
    }

    const profileResponse = await fetch(`${backendUrl}/v1/profile`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const profilePayload = await profileResponse.json().catch(() => null) as {
      data?: unknown;
      message?: string;
    } | null;
    if (!profileResponse.ok) {
      return NextResponse.json(profilePayload ?? {}, { status: profileResponse.status });
    }

    const profileSetupRequired = loginPayload?.data?.profile_setup_required;
    const response = NextResponse.json({
      status: loginPayload?.status,
      message: loginPayload?.message,
      code: loginPayload?.code,
      data: {
        profile_setup_required: profileSetupRequired,
        user: profilePayload?.data ?? null,
      },
    });
    setAuthCookie(response, token);
    if (profileSetupRequired !== undefined) {
      setProfileSetupRequiredCookie(response, profileSetupRequired);
    }
    return response;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "We couldn’t sign you in right now. Please try again." },
      { status: 502 },
    );
  }
}
