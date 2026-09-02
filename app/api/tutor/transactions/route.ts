import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function GET(request: Request) {
  return forwardWithSession(request, "/v1/tutor/transactions");
}
