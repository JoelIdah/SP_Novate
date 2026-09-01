import { forwardAuthRequest } from "@/lib/server/apiRequest";

export async function POST(request: Request) {
  return forwardAuthRequest(request, "/v1/auth/signup");
}
