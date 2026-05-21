"use client";

type BecomeTutorModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BecomeTutorModal({ open, onCancel, onConfirm }: BecomeTutorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 px-[1em]">
      <div className="w-full max-w-[28em] rounded-[1em] border border-[#e7eaf4] bg-white p-[1.3em] shadow-[0_30px_60px_rgba(26,33,67,0.22)]">
        <h2 className="text-[1.05em] font-semibold text-[#2b3350]">Become a tutor?</h2>
        <p className="mt-[0.6em] text-[0.9em] leading-relaxed text-[#68718a]">
          Are you sure you want to switch to tutor mode? Your dashboard view will change to the tutor workspace.
        </p>

        <div className="mt-[1.2em] flex items-center justify-end gap-[0.7em]">
          <button
            className="rounded-full border border-[#d8deed] bg-white px-[1em] py-[0.45em] text-[0.8em] font-semibold text-[#5e667f] transition hover:bg-[#f6f8fc]"
            onClick={onCancel}
            type="button"
          >
            Not now
          </button>

          <button
            className="rounded-full bg-[#4d4bc5] px-[1em] py-[0.45em] text-[0.8em] font-semibold text-white transition hover:bg-[#4341b1]"
            onClick={onConfirm}
            type="button"
          >
            Yes, become a tutor
          </button>
        </div>
      </div>
    </div>
  );
}

