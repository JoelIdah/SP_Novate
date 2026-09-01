import { forwardPublicAuth } from "@/lib/server/backend";

export async function POST(request: Request) {
  return forwardPublicAuth(request, "/v1/auth/signup");
}
