import { forwardWithSession } from "@/lib/server/routeForwarding";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  return forwardWithSession(request, `/v1/student/bookings/${encodeURIComponent(bookingId)}/rate`);
}
