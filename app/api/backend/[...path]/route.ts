import { proxyAuthenticatedRequest } from "@/lib/server/proxyAuthenticatedGet";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0 || path.some((part) => !part || part === "." || part === "..")) {
    return new Response(null, { status: 404 });
  }
  return proxyAuthenticatedRequest(request, `/v1/${path.map(encodeURIComponent).join("/")}`);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
