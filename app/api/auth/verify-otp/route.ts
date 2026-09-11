import { NextResponse } from "next/server";

import {
  getBackendUrl,
  isSameOriginMutation,
  setAuthCookie,
} from "@/lib/server/authSession";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, message: "You don’t have permission to perform this action." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null) as {
    email?: unknown;
    token?: unknown;
    establish_session?: unknown;
  } | null;
  if (!body || typeof body.email !== "string" || typeof body.token !== "string") {
    return NextResponse.json(
      { status: "error", code: 400, message: "Invalid verification request." },
      { status: 400 },
    );
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { status: "error", code: 500, message: "Verification is temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/v1/auth/verify-otp`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, token: body.token }),
      cache: "no-store",
    });
    const payload = await backendResponse.json().catch(() => null) as {
      status?: string;
      message?: string;
      code?: number;
      data?: { token?: string; user?: unknown };
    } | null;

    if (!backendResponse.ok) {
      return NextResponse.json(payload ?? {}, { status: backendResponse.status });
    }

    const response = NextResponse.json({
      status: payload?.status,
      message: payload?.message,
      code: payload?.code,
      data: payload?.data ? { user: payload.data.user } : undefined,
    });
    if (body.establish_session === true) {
      const token = payload?.data?.token?.trim();
      if (!token) {
        return NextResponse.json(
          { status: "error", code: 502, message: "We couldn’t verify your code. Please request a new code and try again." },
          { status: 502 },
        );
      }
      setAuthCookie(response, token);
    }
    return response;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "We couldn’t verify your code right now. Please try again." },
      { status: 502 },
    );
  }
}
