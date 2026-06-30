import { AuthCardHeader } from "../../components/signup/AuthCardHeader";
import { AuthCard, AuthPrimaryLink } from "../../components/signup/AuthPrimitives";
import { AuthShell } from "../../components/signup/AuthShell";

export default function ComingSoonPage() {
  return (
    <AuthShell>
      <AuthCard className="pb-[1.5em] pt-[1.4em]" tone="gradient">
        <AuthCardHeader showPrompt={false} title="Coming soon" />
        <div className="mx-auto w-full max-w-[24em] text-center">
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

