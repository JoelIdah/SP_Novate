import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function GET(request: Request, context: RouteContext<"/api/tutor/bookings/[bookingId]">) {
  const { bookingId } = await context.params;
  return forwardWithSession(request, `/v1/tutor/bookings/${encodeURIComponent(bookingId)}`);
}
