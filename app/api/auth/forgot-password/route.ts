import { forwardPublicAuth } from "@/lib/server/routeForwarding";

export async function POST(request: Request) {
  return forwardPublicAuth(request, "/v1/auth/forget-password");
}
