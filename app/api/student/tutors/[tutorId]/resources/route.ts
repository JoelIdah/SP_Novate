import { proxyAuthenticatedGet } from "@/lib/server/proxyAuthenticatedGet";

type RouteContext = { params: Promise<{ tutorId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { tutorId } = await context.params;
  return proxyAuthenticatedGet(request, `/v1/student/tutors/${encodeURIComponent(tutorId)}/resources`);
}
