import Link from "next/link";
import { AuthShell } from "../../components/signup/AuthShell";

export default function ComingSoonPage() {
  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.35em] border-[0.08em] border-[#d9dde8] bg-gradient-to-b from-white to-[#fcfdff] px-[1.5em] pb-[1.5em] pt-[1.4em] shadow-[0_14px_34px_rgba(23,30,63,0.11)]">
        <div className="mx-auto w-full max-w-[24em] text-center">
          <p className="text-[0.72em] font-semibold uppercase tracking-[0.14em] text-[#6f8fb5]">SP Novate</p>
          <h1 className="mt-[0.45em] text-[1.3em] font-semibold text-[#1f2a44]">Coming soon</h1>
          <p className="mt-[0.7em] text-[0.82em] font-medium leading-relaxed text-[#7a8398]">
            Direct access to SP Novate is temporarily unavailable while this experience is still in development.
          </p>
          <Link
            href="/login"
            className="mt-[1.2em] inline-flex h-[3em] w-full items-center justify-center rounded-full bg-[#231d71] px-[1.2em] text-[0.84em] font-semibold text-white transition-colors hover:bg-[#1c175f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b88f5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

