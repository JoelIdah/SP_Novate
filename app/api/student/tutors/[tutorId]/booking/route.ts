import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

type RouteContext = { params: Promise<{ tutorId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { tutorId } = await context.params;
  return forwardAuthenticatedRequest(request, `/v1/student/tutors/${encodeURIComponent(tutorId)}/booking`);
}
