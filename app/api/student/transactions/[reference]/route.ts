import { forwardAuthenticatedRequest } from "@/lib/server/apiRequest";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return forwardAuthenticatedRequest(request, `/v1/student/transactions/${encodeURIComponent(reference)}`);
}
