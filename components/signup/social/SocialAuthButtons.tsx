import Script from "next/script";

import { AppleIcon, FacebookIcon, GoogleIcon } from "../icons";
import type { SocialProvider } from "./types";

export function SocialAuthButtons({
  activeSocialProvider,
  onGoogleClick,
  onFacebookClick,
  onAppleClick,
}: {
  activeSocialProvider: SocialProvider | null;
  onGoogleClick: () => void;
  onFacebookClick: () => void;
  onAppleClick: () => void;
}) {
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div className="space-y-2.5">
        <button
          className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={Boolean(activeSocialProvider)}
          onClick={onGoogleClick}
          type="button"
        >
          <GoogleIcon />
          {activeSocialProvider === "google" ? "Connecting Google..." : "Continue with Google"}
        </button>
        <button
          className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={Boolean(activeSocialProvider)}
          onClick={onFacebookClick}
          type="button"
        >
          <FacebookIcon />
          Continue with Facebook
        </button>
        <button
          className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={Boolean(activeSocialProvider)}
          onClick={onAppleClick}
          type="button"
        >
          <AppleIcon />
          Continue with Apple
        </button>
      </div>
    </>
  );
}
