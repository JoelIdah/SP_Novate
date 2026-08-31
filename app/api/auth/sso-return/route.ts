import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { readAuthToken } from "@/lib/server/authSession";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const resolveSafeNextPath = (candidate: string | null): string => {
  if (!candidate) return "/";
  const trimmed = candidate.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")
    ? trimmed
    : "/";
};

const getAllowedCallbackOrigins = () =>
  (
    process.env.SPMEET_ALLOWED_CALLBACK_ORIGINS ??
    process.env.NEXT_PUBLIC_SPMEET_ALLOWED_CALLBACK_ORIGINS ??
    ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const secureHeaders = (response: NextResponse, formAction?: string, nonce?: string) => {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", formAction ? "origin" : "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Content-Security-Policy",
    formAction && nonce
      ? `default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action ${formAction}; script-src 'nonce-${nonce}'`
      : "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  );
  return response;
};

const reject = (message: string, status: number) =>
  secureHeaders(NextResponse.json({ status: "error", message }, { status }));

export async function GET(request: Request) {
  const token = readAuthToken(request);
  if (!token) return reject("Authentication is required.", 401);

  const requestUrl = new URL(request.url);
  const returnTo = requestUrl.searchParams.get("returnTo")?.trim();
  const state = requestUrl.searchParams.get("state")?.trim();
  if (!returnTo || !state || state.length > 200) {
    return reject("Invalid SP Meet return request.", 400);
  }

  let callback: URL;
  try {
    callback = new URL(returnTo);
  } catch {
    return reject("Invalid SP Meet callback.", 400);
  }

  if (
    !["http:", "https:"].includes(callback.protocol) ||
    !getAllowedCallbackOrigins().includes(callback.origin) ||
    callback.pathname !== "/auth/callback" ||
    callback.username ||
    callback.password ||
    callback.search ||
    callback.hash
  ) {
    return reject("Untrusted SP Meet callback.", 400);
  }

  const nonce = randomBytes(18).toString("base64url");
  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Returning to SP Meet</title></head>
  <body>
    <form id="sso-return" method="post" action="${escapeHtml(callback.toString())}">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <input type="hidden" name="state" value="${escapeHtml(state)}">
      <input type="hidden" name="next" value="${escapeHtml(resolveSafeNextPath(requestUrl.searchParams.get("next")))}">
      <noscript><button type="submit">Continue to SP Meet</button></noscript>
    </form>
    <script nonce="${nonce}">document.getElementById("sso-return").submit();</script>
  </body>
</html>`;

  return secureHeaders(
    new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
    callback.origin,
    nonce,
  );
}
