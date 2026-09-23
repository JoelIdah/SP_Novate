import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function GET(request: Request) {
  return forwardWithSession(request, "/v1/tutor/settings/account");
}

export async function PATCH(request: Request) {
  return forwardWithSession(request, "/v1/tutor/settings/account");
}
