import { forwardPublicAuth } from "@/lib/server/routeForwarding";

export async function PUT(request: Request) {
  return forwardPublicAuth(request, "/v1/auth/reset-password");
}
