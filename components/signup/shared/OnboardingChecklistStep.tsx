import { OnboardingNavbar } from "../OnboardingNavbar";
import { Button } from "../../ui/Button";
import { getStepIconKindFromLabel, StepItemIcon } from "./StepItemIcon";

type OnboardingChecklistStepProps = {
  items: string[];
  profile?: { email?: string; firstName?: string };
  subtitle: string;
  onCancel: () => void;
  onContinue: () => void;
};

export function OnboardingChecklistStep({
  items,
  profile,
  subtitle,
  onCancel,
  onContinue,
}: OnboardingChecklistStepProps) {
  const firstName = profile?.firstName?.trim();

  return (
    <main className="flex h-[100svh] flex-col overflow-hidden bg-white text-[#1f2430]">
      <OnboardingNavbar email={profile?.email ?? ""} name={firstName ?? ""} />

      <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-6">
        <div className="w-full max-w-[33.75rem] text-center">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1f2430] sm:text-3xl">
            {firstName ? `Welcome, ${firstName}!` : "Welcome!"}
          </h1>
          <p className="mx-auto mt-2 max-w-[29rem] text-sm font-medium leading-relaxed text-[#7d869c]">{subtitle}</p>

          <div className="mx-auto mt-7 w-full max-w-[25rem] space-y-3 text-left">
            {items.map((item) => (
              <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[#dce3ef] bg-[#f5f8fc] px-4" key={item}>
                <StepItemIcon kind={getStepIconKindFromLabel(item)} />
                <span className="text-sm font-semibold text-[#38445e]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 grid w-full max-w-[25rem] grid-cols-[auto_1fr] gap-2 sm:flex sm:justify-center">
            <Button onClick={onCancel} size="lg" variant="secondary">Back</Button>
            <Button onClick={onContinue} size="lg" variant="primary">
              Let&apos;s get started
              <span aria-hidden>→</span>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
