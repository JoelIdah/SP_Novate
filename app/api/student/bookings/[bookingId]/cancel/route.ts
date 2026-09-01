import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  return forwardAuthenticatedRequest(request, `/v1/student/bookings/${encodeURIComponent(bookingId)}/cancel`);
}
