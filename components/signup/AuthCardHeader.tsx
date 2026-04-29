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
      <div className="absolute left-1/2 -top-5 -translate-x-1/2 sm:-top-6">
        <div className="overflow-hidden rounded-[0.7rem] shadow-[0_9px_20px_rgba(53,49,177,0.25)]">
          <Image
            alt="SP Novate"
            className="h-[52px] w-auto sm:h-[56px]"
            height={56}
            priority
            src="/logo/logo.png"
            width={56}
          />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-[1.7rem] font-bold tracking-[-0.02em] text-[#1d2230] sm:text-[1.85rem]">{title}</h1>
        {showPrompt ? (
          <p className="mt-1 text-[0.74rem] font-medium text-[#8d95a8] sm:text-[0.76rem]">
            {promptText}{" "}
            <Link
              href={promptLinkHref}
              className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]"
            >
              {promptLinkLabel}
            </Link>
          </p>
        ) : null}
      </div>
    </>
  );
}
