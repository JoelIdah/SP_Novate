import Image from "next/image";
import Link from "next/link";

type AuthCardHeaderProps = {
  title?: string;
  promptText?: string;
  promptLinkHref?: string;
  promptLinkLabel?: string;
  showPrompt?: boolean;
};

export function AuthCardHeader({
  title = "Create an account",
  promptText = "Already have an account?",
  promptLinkHref = "/login",
  promptLinkLabel = "Log In",
  showPrompt = true,
}: AuthCardHeaderProps) {
  return (
    <>
      <div className="absolute left-1/2 -top-4 -translate-x-1/2 sm:-top-5">
        <div className="overflow-hidden rounded-[0.7rem] shadow-[0_9px_20px_rgba(53,49,177,0.25)]">
          <Image
            alt="SP Novate"
            className="h-[clamp(2.4rem,2.35vw,3.4rem)] w-auto"
            height={54}
            priority
            src="/logo/logo.png"
            width={54}
          />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-[clamp(1.12rem,1.05vw,1.65rem)] font-bold tracking-[-0.02em] text-[#1d2230]">{title}</h1>
        {showPrompt ? (
          <p className="mt-1.5 text-[clamp(0.68rem,0.62vw,0.82rem)] font-medium text-[#98a0b2]">
            {promptText}{" "}
            <Link
              href={promptLinkHref}
              className="font-semibold text-[#1f7ec4] transition-colors hover:text-[#17679f]"
            >
              {promptLinkLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}


