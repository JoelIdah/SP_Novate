import { proxyAuthenticatedGet } from "../../../../lib/server/proxyAuthenticatedGet";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return proxyAuthenticatedGet(request, "/v1/student/dashboard");
}
