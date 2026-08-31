type SearchParamsReader = {
  get: (name: string) => string | null;
};

type SsoReturnResult =
  | { status: "not_requested" }
  | { status: "error"; message: string }
  | { status: "submitted" };

const resolveSafeNextPath = (candidate: string | null): string => {
  if (!candidate) return "/";
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  if (trimmed.includes("://")) return "/";
  return trimmed;
};

export const submitSsoReturn = ({
  searchParams,
  token,
}: {
  searchParams: SearchParamsReader;
  token: string;
}): SsoReturnResult => {
  const requestedReturnTo = searchParams.get("returnTo")?.trim();
  if (!requestedReturnTo) return { status: "not_requested" };

  const allowedOrigins = (
    process.env.NEXT_PUBLIC_SPMEET_ALLOWED_CALLBACK_ORIGINS ?? ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return {
      status: "error",
      message: "SSO callback origins are not configured.",
    };
  }

  let target: URL;
  try {
    target = new URL(requestedReturnTo);
  } catch {
    return { status: "error", message: "Untrusted or invalid callback URL." };
  }

  if (
    !["http:", "https:"].includes(target.protocol) ||
    !allowedOrigins.includes(target.origin) ||
    target.pathname !== "/auth/callback" ||
    target.username ||
    target.password ||
    target.search ||
    target.hash
  ) {
    return { status: "error", message: "Untrusted or invalid callback URL." };
  }

  const state = searchParams.get("state")?.trim();
  if (!state || state.length > 200) {
    return {
      status: "error",
      message: "Missing SSO state. Please retry login from SPMeet.",
    };
  }

  const cleanToken = token.trim();
  if (!cleanToken) {
    return { status: "error", message: "Missing authentication token." };
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = target.toString();
  form.style.display = "none";

  const fields = {
    token: cleanToken,
    state,
    next: resolveSafeNextPath(searchParams.get("next")),
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  return { status: "submitted" };
};
