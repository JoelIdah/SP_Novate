import { forwardWithSession } from "@/lib/server/backend";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return forwardWithSession(request, `/v1/student/transactions/${encodeURIComponent(reference)}`);
}
