"use client";

type TutorConfirmationPillProps = {
  show: boolean;
  message?: string;
};

export function TutorConfirmationPill({
  show,
  message = "You are now a tutor. Welcome to your tutor dashboard.",
}: TutorConfirmationPillProps) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-[1em] z-[110] -translate-x-1/2 px-[0.8em]">
      <div
        className={`max-w-[36em] rounded-full border border-[#bbf7d0] bg-[#ecfdf3] px-[1em] py-[0.55em] text-[0.78em] font-semibold text-[#166534] shadow-[0_0.6em_1.7em_rgba(22,101,52,0.18)] transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "-translate-y-[0.9em] opacity-0"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
