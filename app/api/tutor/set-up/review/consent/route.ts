import { proxyAuthenticatedRequest } from "../../../../../../lib/server/proxyAuthenticatedGet";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyAuthenticatedRequest(request, "/v1/tutor/set-up/review/consent");
}
