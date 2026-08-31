import { NextResponse } from "next/server";
import {
  clearAuthCookie,
  getApiBaseUrl,
  isSameOriginMutation,
  readAuthToken,
} from "./authSession";

export async function proxyAuthenticatedGet(
  request: Request,
  backendPath: string,
) {
  return proxyAuthenticatedRequest(request, backendPath);
}

export async function proxyAuthenticatedRequest(
  request: Request,
  backendPath: string,
) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, error: "forbidden_origin" },
      { status: 403 },
    );
  }

  const token = readAuthToken(request);
  if (!token) {
    return NextResponse.json(
      { status: "error", code: 401, error: "unauthorized" },
      { status: 401 },
    );
  }

  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    return NextResponse.json(
      { status: "error", code: 500, error: "server_configuration" },
      { status: 500 },
    );
  }

  const requestUrl = new URL(request.url);
  const backendUrl = `${apiBaseUrl.replace(/\/$/, "")}${backendPath}${requestUrl.search}`;

  try {
    const contentType = request.headers.get("content-type");
    const requestBody = request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: requestBody,
      cache: "no-store",
    });
    const body = await response.text();

    const proxiedResponse = new NextResponse(body, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
    if (response.status === 401) clearAuthCookie(proxiedResponse);
    return proxiedResponse;
  } catch (error) {
    console.error("Backend request could not be completed", {
      backendPath,
      error,
      method: request.method,
    });
    return NextResponse.json(
      {
        status: "error",
        code: 502,
        error: "upstream_unavailable",
      },
      { status: 502 },
    );
  }
}
