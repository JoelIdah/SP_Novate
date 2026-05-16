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
      <div className="absolute left-1/2 -top-[1.25em] -translate-x-1/2 sm:-top-[1.45em]">
        <div className="overflow-hidden rounded-[0.7em] shadow-[0_9px_20px_rgba(53,49,177,0.25)]">
          <Image
            alt="SP Novate"
            className="h-[2.7em] w-auto"
            height={54}
            priority
            src="/logo/logo.png"
            width={54}
          />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-[1.45em] font-bold tracking-[-0.02em] text-[#1d2230]">{title}</h1>
        {showPrompt ? (
          <p className="mt-[0.6em] text-[0.82em] font-medium text-[#98a0b2]">
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


