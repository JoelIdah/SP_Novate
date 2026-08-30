import { proxyAuthenticatedGet } from "../../../../../lib/server/proxyAuthenticatedGet";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return proxyAuthenticatedGet(request, `/v1/student/transactions/${encodeURIComponent(reference)}`);
}
