import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return forwardAuthenticatedRequest(request, "/v1/tutor/set-up/review");
}
