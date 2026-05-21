"use client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, options: { theme?: string; size?: string; type?: string; text?: string }) => void;
};

type GoogleGlobal = {
  accounts?: {
    id?: GoogleAccountsId;
  };
};

let googleInitialized = false;
let googlePromptInFlight = false;
let googleButtonHost: HTMLDivElement | null = null;
let googleInFlightTimeout: number | null = null;
let latestHandlers: { onToken: (token: string) => void; onError: (message: string) => void } | null = null;

function clearInFlightState() {
  googlePromptInFlight = false;
  if (googleInFlightTimeout !== null) {
    window.clearTimeout(googleInFlightTimeout);
    googleInFlightTimeout = null;
  }
}

function getOrCreateGoogleButtonHost() {
  if (!googleButtonHost) {
    googleButtonHost = document.createElement("div");
    googleButtonHost.id = "sp-google-hidden-button-host";
    googleButtonHost.style.position = "fixed";
    googleButtonHost.style.left = "-9999px";
    googleButtonHost.style.top = "0";
    googleButtonHost.style.width = "1px";
    googleButtonHost.style.height = "1px";
    googleButtonHost.style.opacity = "0";
    googleButtonHost.style.pointerEvents = "none";
    document.body.appendChild(googleButtonHost);
  }
  return googleButtonHost;
}

export function startGoogleAuth(options: { onToken: (token: string) => void; onError: (message: string) => void }) {
  latestHandlers = options;
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    options.onError("Google auth is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
    return;
  }

  const google = (window as Window & { google?: GoogleGlobal }).google;
  const googleAccountsId = google?.accounts?.id;

  if (!googleAccountsId) {
    options.onError("Google SDK is not loaded yet. Please try again.");
    return;
  }

  if (!googleInitialized) {
    googleAccountsId.initialize({
      client_id: googleClientId,
      callback: (response) => {
        const handlers = latestHandlers;
        clearInFlightState();
        if (!handlers) return;

        const token = response.credential ?? "";
        if (!token) {
          handlers.onError("Google sign-in was cancelled or did not return a credential. Please try again.");
          return;
        }
        handlers.onToken(token);
      },
    });
    googleInitialized = true;
  }

  if (googlePromptInFlight) {
    options.onError("Google sign-in is already in progress. Please wait.");
    return;
  }

  googlePromptInFlight = true;
  const buttonHost = getOrCreateGoogleButtonHost();
  buttonHost.innerHTML = "";
  googleAccountsId.renderButton(buttonHost, {
    theme: "outline",
    size: "large",
    type: "standard",
    text: "continue_with",
  });

  const googleButton = buttonHost.querySelector("div[role='button'], button") as HTMLElement | null;
  if (!googleButton) {
    clearInFlightState();
    options.onError("Unable to open Google sign-in popup. Please try again.");
    return;
  }

  googleInFlightTimeout = window.setTimeout(() => {
    clearInFlightState();
    const handlers = latestHandlers;
    handlers?.onError("Google sign-in was closed or timed out. Please try again.");
  }, 60000);

  googleButton.click();
}

