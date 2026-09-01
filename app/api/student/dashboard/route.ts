import { forwardWithSession } from "@/lib/server/backend";

export async function GET(request: Request) {
  return forwardWithSession(request, "/v1/student/dashboard");
}
