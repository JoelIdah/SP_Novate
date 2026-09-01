import { forwardWithSession } from "@/lib/server/backend";

type RouteContext = { params: Promise<{ resourceId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { resourceId } = await context.params;
  return forwardWithSession(
    request,
    `/v1/tutor/resources/${encodeURIComponent(resourceId)}`,
  );
}
