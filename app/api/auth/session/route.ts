import { NextResponse } from "next/server";

import {
  clearAuthCookie,
  getBackendUrl,
  readAuthToken,
} from "@/lib/server/authSession";

export async function GET(request: Request) {
  const token = readAuthToken(request);
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(`${backendUrl}/v1/profile`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await backendResponse.json().catch(() => null) as { data?: unknown } | null;

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { authenticated: false, user: null },
        { status: backendResponse.status },
      );
      if (backendResponse.status === 401) clearAuthCookie(response);
      return response;
    }

    return NextResponse.json({ authenticated: true, user: payload?.data ?? null });
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 502 },
    );
  }
}

