import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return forwardAuthenticatedRequest(request, "/v1/tutor/set-up/compensation");
}
