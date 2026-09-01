import { NextResponse } from "next/server";

import {
  clearAuthCookie,
  getBackendUrl,
  isSameOriginMutation,
  readAuthToken,
} from "./authSession";

function originError() {
  return NextResponse.json(
    { status: "error", code: 403, message: "Forbidden" },
    { status: 403 },
  );
}

function configurationError() {
  return NextResponse.json(
    { status: "error", code: 500, message: "API_BASE_URL is not configured." },
    { status: 500 },
  );
}

export async function forwardPublicAuth(request: Request, backendPath: string) {
  if (!isSameOriginMutation(request)) return originError();

  const backendUrl = getBackendUrl();
  if (!backendUrl) return configurationError();

  try {
    const response = await fetch(`${backendUrl}${backendPath}`, {
      method: request.method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "The backend is unavailable." },
      { status: 502 },
    );
  }
}

export async function forwardWithSession(
  request: Request,
  backendPath: string,
) {
  if (!isSameOriginMutation(request)) return originError();

  const token = readAuthToken(request);
  if (!token) {
    return NextResponse.json(
      { status: "error", code: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const backendUrl = getBackendUrl();
  if (!backendUrl) return configurationError();

  try {
    const contentType = request.headers.get("content-type");
    const response = await fetch(`${backendUrl}${backendPath}${new URL(request.url).search}`, {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
    });
    const result = new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
    if (response.status === 401) clearAuthCookie(result);
    return result;
  } catch {
    return NextResponse.json(
      { status: "error", code: 502, message: "The backend is unavailable." },
      { status: 502 },
    );
  }
}
