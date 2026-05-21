import Link from "next/link";

import { SuccessBadgeIcon } from "./icons";

export function SetupSuccessView() {
  return (
    <section className="mx-auto flex h-full w-full max-w-[820px] items-center justify-center px-4 py-8 sm:px-8">
      <div className="text-center">
        <div className="mx-auto mb-5 w-fit">
          <SuccessBadgeIcon />
        </div>
        <h1 className="text-[2.2rem] font-bold tracking-[-0.02em] text-[#1d2331]">You&apos;re good to go.</h1>
        <p className="mx-auto mt-3 max-w-[360px] text-sm font-medium leading-relaxed text-[#8c93a7]">
          Your profile is set up. You can now access all of the features on the dashboard.
        </p>
        <Link className="mt-8 inline-flex h-10 items-center rounded-full border border-[#d8dde8] bg-white px-6 text-sm font-semibold text-[#3f5f57] hover:bg-[#f8fafc]" href="/dashboard">
          Proceed to dashboard
        </Link>
      </div>
    </section>
  );
}

