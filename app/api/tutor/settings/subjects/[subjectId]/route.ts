import { forwardWithSession } from "@/lib/server/routeForwarding";

export async function PATCH(request: Request, context: RouteContext<"/api/tutor/settings/subjects/[subjectId]">) {
  const { subjectId } = await context.params;
  return forwardWithSession(request, `/v1/tutor/settings/subjects/${encodeURIComponent(subjectId)}`);
}
