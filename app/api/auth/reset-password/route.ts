import { forwardAuthRequest } from "@/lib/server/apiRequest";

export async function PUT(request: Request) {
  return forwardAuthRequest(request, "/v1/auth/reset-password");
}
