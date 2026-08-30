import { proxyAuthenticatedRequest } from "@/lib/server/proxyAuthenticatedGet";

export async function POST(request: Request) {
  return proxyAuthenticatedRequest(request, "/v1/user/locations/update");
}
