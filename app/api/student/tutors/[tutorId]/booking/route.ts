import { proxyAuthenticatedRequest } from "@/lib/server/proxyAuthenticatedGet";

type RouteContext = { params: Promise<{ tutorId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { tutorId } = await context.params;
  return proxyAuthenticatedRequest(request, `/v1/student/tutors/${encodeURIComponent(tutorId)}/booking`);
}
