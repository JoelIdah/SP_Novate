import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function GET(request: Request, context: RouteContext<"/api/tutor/transactions/[reference]">) {
  const { reference } = await context.params;
  return forwardWithSession(request, `/v1/tutor/transactions/${encodeURIComponent(reference)}`);
}
