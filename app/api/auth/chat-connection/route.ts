import { NextResponse } from "next/server";

import {
  getBackendUrl,
  isSameOriginMutation,
  readAuthToken,
} from "@/lib/server/authSession";

export const dynamic = "force-dynamic";

function toWebSocketUrl(apiBaseUrl: string): string {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/ws/chat/global`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const token = readAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const apiBaseUrl = getBackendUrl();
  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: "Chat is temporarily unavailable." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { token, websocketUrl: toWebSocketUrl(apiBaseUrl) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
