import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function PATCH(request: Request) {
  return forwardWithSession(request, "/v1/student/profile/update");
}
