import { signUpOptions, type SignUpRole } from "./types";

export function RoleStep({ onSelect }: { onSelect: (role: SignUpRole) => void }) {
  return (
    <div className="mx-auto mt-6 grid max-w-[17rem] grid-cols-2 gap-3 sm:mt-7 sm:max-w-[18rem]">
      {signUpOptions.map((option) => (
        <button
          className={`group flex min-h-[100px] flex-col items-center justify-center rounded-[0.8rem] border px-3 py-4 text-center transition-colors ${
            option.id === "student"
              ? "border-[#cac8f0] bg-[#eeecff] text-[#5a57cb]"
              : "border-[#ebedf4] bg-white text-[#5f6678] hover:border-[#d2d5e2] hover:bg-[#f9f9fb]"
          }`}
          key={option.id}
          onClick={() => onSelect(option.id)}
          type="button"
        >
          <div
            className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-[0.6rem] ${
              option.id === "student" ? "bg-[#cac8f5] text-[#5a57cb]" : "bg-[#edf0f4] text-[#9ca4b5]"
            }`}
          >
            <svg aria-hidden className="h-[1.05rem] w-[1.05rem]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" />
              <path clipRule="evenodd" d="M4 20c0-3.3137 3.5817-6 8-6s8 2.6863 8 6H4z" fillRule="evenodd" />
            </svg>
          </div>
          <span className="text-[0.775rem] font-semibold leading-tight tracking-[-0.01em]">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
