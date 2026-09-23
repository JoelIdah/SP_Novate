type SearchParamsReader = {
  get: (name: string) => string | null;
};

const resolveSafeNextPath = (candidate: string | null): string => {
  if (!candidate) return "/";
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return "/";
  }
  return trimmed;
};

export function getSsoReturnPath(searchParams: SearchParamsReader): string | null {
  const requestedReturnTo = searchParams.get("returnTo")?.trim();
  const state = searchParams.get("state")?.trim();
  if (!requestedReturnTo || !state || state.length > 200) return null;

  let callback: URL;
  try {
    callback = new URL(requestedReturnTo);
  } catch {
    return null;
  }

  if (
    !["http:", "https:"].includes(callback.protocol) ||
    callback.pathname !== "/auth/callback" ||
    callback.username ||
    callback.password ||
    callback.search ||
    callback.hash
  ) {
    return null;
  }

  const params = new URLSearchParams({
    returnTo: callback.toString(),
    state,
    next: resolveSafeNextPath(searchParams.get("next")),
  });
  return `/api/auth/sso-return?${params.toString()}`;
}
