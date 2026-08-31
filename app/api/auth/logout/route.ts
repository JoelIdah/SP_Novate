import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/server/authSession";

export async function POST() {
  const response = NextResponse.json({ status: "success" });
  clearAuthCookie(response);
  return response;
}

