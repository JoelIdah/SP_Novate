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

  googleAccountsId.initialize({
    client_id: googleClientId,
    callback: (response) => {
      options.onToken(response.credential ?? "");
    },
  });

  googleAccountsId.prompt();
}
