type FacebookAuthResponse = {
  status?: string;
  authResponse?: {
    accessToken?: string;
  };
};

type FacebookSdk = {
  init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (callback: (response: FacebookAuthResponse) => void, options?: { scope?: string }) => void;
};

type FacebookWindow = Window & {
  FB?: FacebookSdk;
};

const FACEBOOK_SDK_VERSION = "v19.0";
let facebookInitialized = false;

export function initializeFacebookSdk() {
  if (facebookInitialized) return;

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  if (!appId) return;

  const fb = (window as FacebookWindow).FB;
  if (!fb) return;

  fb.init({
    appId,
    cookie: true,
    xfbml: false,
    version: FACEBOOK_SDK_VERSION,
  });

  facebookInitialized = true;
}

export function startFacebookAuth(options: { onToken: (token: string) => void; onError: (message: string) => void }) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  if (!appId) {
    options.onError("Facebook auth is not configured. Add NEXT_PUBLIC_FACEBOOK_APP_ID.");
    return;
  }

  const fb = (window as FacebookWindow).FB;
  if (!fb) {
    options.onError("Facebook SDK is not loaded yet. Please try again.");
    return;
  }

  if (!facebookInitialized) {
    initializeFacebookSdk();
  }

  fb.login(
    (response) => {
      const token = response?.authResponse?.accessToken ?? "";
      if (!token) {
        options.onError("Facebook did not return an access token. Please try again.");
        return;
      }
      options.onToken(token);
    },
    { scope: "email,public_profile" }
  );
}
