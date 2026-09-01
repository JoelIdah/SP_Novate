import { NextResponse } from "next/server";

import { clearAuthCookie, isSameOriginMutation } from "@/lib/server/authSession";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json(
      { status: "error", code: 403, message: "Forbidden" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ status: "success" });
  clearAuthCookie(response);
  return response;
}
