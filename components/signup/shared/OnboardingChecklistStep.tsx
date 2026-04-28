import Image from "next/image";

import { getStepIconKindFromLabel, StepItemIcon } from "./StepItemIcon";

type OnboardingChecklistStepProps = {
  items: string[];
  stepLabel: string;
  subtitle: string;
  onCancel: () => void;
  onContinue: () => void;
};

export function OnboardingChecklistStep({
  items,
  stepLabel,
  subtitle,
  onCancel,
  onContinue,
}: OnboardingChecklistStepProps) {
  return (
    <main className="h-[100svh] overflow-hidden bg-[#f8f9fc] text-[#1f2430]">
      <header className="flex h-14 items-center justify-between border-b border-[#e6e9f2] bg-white px-4 sm:px-6">
        <Image alt="SP Novate" className="h-8 w-auto" height={32} src="/logo/logo.png" width={32} />
        <button className="flex items-center gap-2 rounded-full border border-[#e2e6ef] bg-[#fbfcff] px-2 py-1.5 text-left" type="button">
          <span className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#3d3bb8] text-[0.7rem] font-semibold text-white">O</span>
          <span className="leading-tight">
            <span className="block text-[0.76rem] font-semibold text-[#3d3bb8]">Welcome back, Oluyinka!</span>
            <span className="block text-[0.62rem] text-[#6d758a]">Oluyinka@dotsandsstrokesstudio.com</span>
          </span>
          <span className="ml-1 text-[0.65rem] text-[#6d758a]">v</span>
        </button>
      </header>

      <section className="flex h-[calc(100svh-112px)] items-start justify-center px-4 pt-16">
        <div className="w-full max-w-[540px] text-center">
          <h1 className="text-[2.55rem] font-bold tracking-[-0.02em] text-[#1f2430]">Welcome Oluyinka!</h1>
          <p className="mt-1.5 text-[0.78rem] font-medium text-[#8c93a7]">{subtitle}</p>

          <div className="mx-auto mt-6 w-full max-w-[380px] space-y-2 text-left">
            {items.map((item) => (
              <div key={item} className="flex h-11 items-center gap-2 rounded-[0.58rem] bg-[#e4effa] px-2.5">
                <StepItemIcon kind={getStepIconKindFromLabel(item)} />
                <span className="text-[0.78rem] font-semibold text-[#38445e]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-4 flex w-full max-w-[380px] justify-start">
            <button className="inline-flex h-8.5 items-center gap-2 rounded-full bg-[#231d71] px-4 text-[0.76rem] font-semibold text-white hover:bg-[#1c175f]" onClick={onContinue} type="button">
              <span aria-hidden>→</span>
              Let&apos;s get started
            </button>
          </div>
        </div>
      </section>

      <footer className="flex h-14 items-center justify-between border-t border-[#e6e9f2] bg-white/95 px-3 sm:px-5">
        <div className="flex items-center gap-2 text-[0.72rem] text-[#5f6780]">
          <span className="rounded-full border border-[#c7cdfd] bg-[#f2f3ff] px-2 py-1 font-semibold text-[#5852ce]">{stepLabel}</span>
          <span>›</span>
          <span className="font-medium">Profile set up</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="h-8.5 rounded-full border border-[#d8dde8] px-5 text-[0.78rem] font-semibold text-[#6f778c]" onClick={onCancel} type="button">Cancel</button>
          <button className="h-8.5 rounded-full bg-[#918ed8] px-6 text-[0.78rem] font-semibold text-white" onClick={onContinue} type="button">Continue</button>
        </div>
      </footer>
    </main>
  );
}
