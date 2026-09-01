import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

type RouteContext = { params: Promise<{ path?: string[] }> };

async function forward(request: Request, context: RouteContext) {
  const { path = [] } = await context.params;
  const suffix = path.length
    ? `/${path.map(encodeURIComponent).join("/")}`
    : "";
  return forwardAuthenticatedRequest(request, `/v1/tutor/resources${suffix}`);
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
