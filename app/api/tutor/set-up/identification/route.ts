import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function POST(request: Request) {
  return forwardWithSession(request, "/v1/tutor/set-up/identification");
}
