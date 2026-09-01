import { forwardPublicAuth } from "@/lib/server/backend";

export async function PUT(request: Request) {
  return forwardPublicAuth(request, "/v1/auth/reset-password");
}
