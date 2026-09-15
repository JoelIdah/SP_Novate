import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function POST(request: Request, context: RouteContext<"/api/tutor/bookings/[bookingId]/decline">) {
  const { bookingId } = await context.params;
  return forwardWithSession(request, `/v1/tutor/bookings/${encodeURIComponent(bookingId)}/decline`);
}
