import { forwardWithSession } from "@/lib/server/backend";

export async function POST(request: Request) {
  return forwardWithSession(request, "/v1/tutor/set-up/personal-details");
}
