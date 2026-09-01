import { NextResponse } from "next/server";

import {
  getApiBaseUrl,
  isSameOriginMutation,
  setAuthCookie,
} from "@/lib/server/authSession";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, message: "Forbidden" },
      { status: 403 },
    );
  }

  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return NextResponse.json(
      { status: "error", code: 500, message: "Authentication is not configured." },
      { status: 500 },
    );
  }

  const body = await request.text();
  try {
    const backendResponse = await fetch(`${apiBaseUrl}/v1/auth/social`, {
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
      return NextResponse.json(payload ?? {}, { status: backendResponse.status });
    }

    const profileResponse = await fetch(`${apiBaseUrl}/v1/profile`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const profilePayload = await profileResponse.json().catch(() => null) as { data?: unknown } | null;
    if (!profileResponse.ok) {
      return NextResponse.json(profilePayload ?? {}, { status: profileResponse.status });
    }

    const response = NextResponse.json({
      status: payload?.status,
      message: payload?.message,
      code: payload?.code,
      data: {
        profile_setup_required: payload?.data?.profile_setup_required,
        user: profilePayload?.data ?? null,
      },
    });
    setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "Could not reach social auth service. Please try again." },
      { status: 502 },
    );
  }
}
