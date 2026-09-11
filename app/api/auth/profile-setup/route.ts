import { NextResponse } from "next/server";

import {
  clearAuthCookie,
  getBackendUrl,
  isSameOriginMutation,
  readAuthToken,
  setAuthCookie,
  setProfileSetupRequiredCookie,
} from "@/lib/server/authSession";

export async function PUT(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, message: "Forbidden" },
      { status: 403 },
    );
  }
  const token = readAuthToken(request);
  if (!token) {
    return NextResponse.json(
      { status: "error", code: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { status: "error", code: 500, message: "Profile setup is not configured." },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/v1/profile/setup`, {
      method: "PUT",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const payload = await backendResponse.json().catch(() => null) as {
      status?: string;
      message?: string;
      code?: number;
      data?: { token?: string; user?: unknown };
    } | null;
    const response = NextResponse.json(
      payload
        ? { ...payload, data: payload.data ? { user: payload.data.user } : undefined }
        : {},
      { status: backendResponse.status },
    );

    if (backendResponse.status === 401) clearAuthCookie(response);
    if (backendResponse.ok) {
      const upgradedToken = payload?.data?.token?.trim();
      if (!upgradedToken) {
        return NextResponse.json(
          { status: "error", code: 502, message: "The profile service returned an invalid response." },
          { status: 502 },
        );
      }
      setAuthCookie(response, upgradedToken);
      setProfileSetupRequiredCookie(response, false);
    }
    return response;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "Could not reach the profile service." },
      { status: 502 },
    );
  }
}
