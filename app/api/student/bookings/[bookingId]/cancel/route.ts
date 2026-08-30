import { proxyAuthenticatedRequest } from "@/lib/server/proxyAuthenticatedGet";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { bookingId } = await context.params;
  return proxyAuthenticatedRequest(request, `/v1/student/bookings/${encodeURIComponent(bookingId)}/cancel`);
}
