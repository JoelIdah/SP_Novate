import Link from "next/link";

import { clearProfileSetupSession } from "../profileSetupSession";
import { SuccessBadgeIcon } from "./icons";

export function SetupSuccessView({ dashboardHref = "/students/dashboard" }: { dashboardHref?: string }) {
  return (
    <section className="mx-auto flex w-full max-w-[32rem] items-center justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-5 w-fit">
          <SuccessBadgeIcon />
        </div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">You&apos;re good to go.</h1>
        <p className="mx-auto mt-3 max-w-[22.5rem] text-sm font-medium leading-relaxed text-[#8c93a7]">
          Your profile is set up. You can now access all of the features on the dashboard.
        </p>
        <Link className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-[#1c175f]" href={dashboardHref} onClick={clearProfileSetupSession}>
          Proceed to dashboard
        </Link>
      </div>
    </section>
  );
}

