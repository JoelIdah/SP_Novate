type AppleAuthorization = {
  id_token?: string;
};

type AppleAuthResponse = {
  authorization?: AppleAuthorization;
};

type AppleAuth = {
  init: (options: {
    clientId: string;
    scope: string;
    redirectURI: string;
    usePopup: boolean;
  }) => void;
  signIn: () => Promise<AppleAuthResponse>;
};

type AppleWindow = Window & {
  AppleID?: {
    auth?: AppleAuth;
  };
};

let appleInitialized = false;

export function initializeAppleSdk() {
  if (appleInitialized) return;

  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

  if (!clientId || !redirectUri) return;

  const appleAuth = (window as AppleWindow).AppleID?.auth;
  if (!appleAuth) return;

  appleAuth.init({
    clientId,
    scope: "name email",
    redirectURI: redirectUri,
    usePopup: true,
  });

  appleInitialized = true;
}

export async function startAppleAuth(options: { onToken: (token: string) => void; onError: (message: string) => void }) {
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    options.onError("Apple auth is not configured. Add NEXT_PUBLIC_APPLE_CLIENT_ID and NEXT_PUBLIC_APPLE_REDIRECT_URI.");
    return;
  }

  const appleAuth = (window as AppleWindow).AppleID?.auth;
  if (!appleAuth) {
    options.onError("Apple SDK is not loaded yet. Please try again.");
    return;
  }

  if (!appleInitialized) {
    initializeAppleSdk();
  }

  try {
    const response = await appleAuth.signIn();
    const token = response?.authorization?.id_token ?? "";
    if (!token) {
      options.onError("Apple did not return an identity token. Please try again.");
      return;
    }
    options.onToken(token);
  } catch {
    options.onError("Apple sign in was cancelled or failed. Please try again.");
  }
}

