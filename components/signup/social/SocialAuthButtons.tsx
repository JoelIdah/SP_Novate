import Script from "next/script";

import { FacebookIcon, GoogleIcon } from "../icons";
import { initializeFacebookSdk } from "./facebook";
import type { SocialProvider } from "./types";

export function SocialAuthButtons({
  activeSocialProvider,
  onGoogleClick,
  onFacebookClick,
}: {
  activeSocialProvider: SocialProvider | null;
  onGoogleClick: () => void;
  onFacebookClick: () => void;
}) {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          initializeFacebookSdk();
        }}
      />
      <div className="auth-social-buttons space-y-[0.55em]">
        <button
          className="auth-social-button flex h-[3em] w-full items-center justify-center gap-[0.7em] rounded-[0.5em] border border-[#d5dae7] bg-white text-[0.84em] font-semibold text-[#596379] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={Boolean(activeSocialProvider)}
          onClick={onGoogleClick}
          type="button"
        >
          <GoogleIcon />
          {activeSocialProvider === "google" ? "Connecting Google..." : "Continue with Google"}
        </button>
        <button
          className="auth-social-button flex h-[3em] w-full items-center justify-center gap-[0.7em] rounded-[0.5em] border border-[#d5dae7] bg-white text-[0.84em] font-semibold text-[#596379] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={Boolean(activeSocialProvider)}
          onClick={onFacebookClick}
          type="button"
        >
          <FacebookIcon />
          {activeSocialProvider === "facebook" ? "Connecting Facebook..." : "Continue with Facebook"}
        </button>
      </div>
    </>
  );
}

