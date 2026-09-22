import { NextResponse } from "next/server";

import {
  getBackendUrl,
  isSameOriginMutation,
  setAuthCookie,
  setProfileSetupRequiredCookie,
} from "@/lib/server/authSession";

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
      { status: "error", code: 500, message: "Social sign-in is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  const body = await request.text();
  try {
    const backendResponse = await fetch(`${backendUrl}/v1/auth/social`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const payload = await backendResponse.json().catch(() => null) as {
      status?: string;
      message?: string;
      code?: number;
      data?: { profile_setup_required?: boolean; token?: string; user?: unknown };
    } | null;

    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? {}, { status: backendResponse.status });
    }

    const token = payload?.data?.token?.trim();
    if (!token) {
      return NextResponse.json(
        {
          status: "error",
          code: 502,
          message: "Social sign-in is temporarily unavailable. Please try again.",
        },
        { status: 502 },
      );
    }

    const profileSetupRequired = payload?.data?.profile_setup_required;
    const response = NextResponse.json({
      status: payload?.status,
      message: payload?.message,
      code: payload?.code,
      data: {
        profile_setup_required: profileSetupRequired,
        user: payload?.data?.user ?? null,
      },
    });
    setAuthCookie(response, token);
    if (profileSetupRequired !== undefined) {
      setProfileSetupRequiredCookie(response, profileSetupRequired);
    }
    return response;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "Social sign-in is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
