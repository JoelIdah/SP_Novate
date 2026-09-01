import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

export async function GET(request: Request) {
  return forwardAuthenticatedRequest(request, "/v1/student/explore/search");
}
