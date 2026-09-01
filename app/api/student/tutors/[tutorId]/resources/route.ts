import { forwardWithSession } from "@/lib/server/backend";

type RouteContext = { params: Promise<{ tutorId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { tutorId } = await context.params;
  return forwardWithSession(request, `/v1/student/tutors/${encodeURIComponent(tutorId)}/resources`);
}
