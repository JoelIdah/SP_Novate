"use client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  prompt: () => void;
};

type GoogleGlobal = {
  accounts?: {
    id?: GoogleAccountsId;
  };
};

let googleInitialized = false;
let googlePromptInFlight = false;

export function startGoogleAuth(options: { onToken: (token: string) => void; onError: (message: string) => void }) {
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
        const token = response.credential ?? "";
        if (!token) {
          options.onError("Google did not return a credential. Please try again.");
          return;
        }
        options.onToken(token);
        googlePromptInFlight = false;
      },
    });
    googleInitialized = true;
  }

  if (googlePromptInFlight) {
    options.onError("Google sign-in is already in progress. Please wait.");
    return;
  }

  googlePromptInFlight = true;
  googleAccountsId.prompt();
}
