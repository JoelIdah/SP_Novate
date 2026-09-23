import { forwardWithSession } from "@/lib/server/routeForwarding";

type RouteContext = { params: Promise<{ tutorId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { tutorId } = await context.params;
  return forwardWithSession(request, `/v1/student/tutors/${encodeURIComponent(tutorId)}/booking/estimate`);
}
