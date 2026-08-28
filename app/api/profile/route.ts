import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { status: "error", message: "Authorization token is required." },
      { status: 401 },
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    return NextResponse.json(
      { status: "error", message: "The API base URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/v1/profile`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authorization,
        },
        cache: "no-store",
      },
    );
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Could not reach the profile service. Please try again.",
      },
      { status: 502 },
    );
  }
}
