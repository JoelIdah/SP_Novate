import { proxyAuthenticatedGet } from "@/lib/server/proxyAuthenticatedGet";

export async function GET(request: Request) {
  return proxyAuthenticatedGet(request, "/v1/student/explore/");
}
