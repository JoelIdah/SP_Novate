import { AuthCard, AuthPrimaryLink } from "../../components/signup/AuthPrimitives";
import { AuthShell } from "../../components/signup/AuthShell";

export default function ComingSoonPage() {
  return (
    <AuthShell>
      <AuthCard className="pb-[1.5em] pt-[1.4em]" tone="gradient">
        <div className="mx-auto w-full max-w-[24em] text-center">
          <p className="text-[0.72em] font-semibold uppercase tracking-[0.14em] text-[#6f8fb5]">SP Novate</p>
          <h1 className="mt-[0.45em] text-[1.3em] font-semibold text-[#1f2a44]">Coming soon</h1>
          <p className="mt-[0.7em] text-[0.82em] font-medium leading-relaxed text-[#7a8398]">
            Direct access to SP Novate is temporarily unavailable while this experience is still in development.
          </p>
          <AuthPrimaryLink className="mt-[1.2em] px-[1.2em]" href="/login">
            Back to login
          </AuthPrimaryLink>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

