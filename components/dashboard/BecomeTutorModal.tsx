"use client";

type BecomeTutorModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BecomeTutorModal({ open, onCancel, onConfirm }: BecomeTutorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e7eaf4] bg-white p-5 shadow-[0_30px_60px_rgba(26,33,67,0.22)]">
        <h2 className="text-[1.05rem] font-semibold text-[#2b3350]">Become a tutor?</h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-[#68718a]">
          Are you sure you want to switch to tutor mode? Your dashboard view will change to the tutor workspace.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            className="rounded-full border border-[#d8deed] bg-white px-4 py-1.5 text-[0.8rem] font-semibold text-[#5e667f] transition hover:bg-[#f6f8fc]"
            onClick={onCancel}
            type="button"
          >
            Not now
          </button>

          <button
            className="rounded-full bg-[#4d4bc5] px-4 py-1.5 text-[0.8rem] font-semibold text-white transition hover:bg-[#4341b1]"
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

