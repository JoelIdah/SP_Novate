import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

export async function POST(request: Request) {
  return forwardAuthenticatedRequest(request, "/v1/user/locations/update");
}
