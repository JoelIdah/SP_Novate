import { FieldLabel } from "./FieldLabel";
import type { ProfileFormState } from "../utils";

type StepOneProfileFormProps = {
  profileForm: ProfileFormState;
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void;
};

export function StepOneProfileForm({ profileForm, onProfileFieldChange }: StepOneProfileFormProps) {
  return (
    <section className="mx-auto h-[calc(100svh-112px)] w-full max-w-[820px] px-4 py-3 sm:px-8">
      <div className="text-center">
        <h1 className="text-[2rem] font-bold tracking-[-0.02em] sm:text-[2.1rem]">Welcome Oluyinka!</h1>
        <p className="mt-1 text-sm font-medium text-[#8c93a7]">We just need a few details to complete your profile.</p>
      </div>

      <form className="mx-auto mt-4 max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label><FieldLabel>Email</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("email", e.target.value)} type="email" value={profileForm.email} /></label>
          <label><FieldLabel>Last name</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("lastName", e.target.value)} type="text" value={profileForm.lastName} /></label>
          <label><FieldLabel>First name</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("firstName", e.target.value)} type="text" value={profileForm.firstName} /></label>
          <label><FieldLabel>Other name</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("otherName", e.target.value)} placeholder="Enter your other name" type="text" value={profileForm.otherName} /></label>
        </div>

        <label className="mt-2.5 block">
          <FieldLabel>Phone number</FieldLabel>
          <div className="mt-1 flex h-9 w-full items-center rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#6c748a]">
            <span className="mr-3">+234</span>
            <span className="text-[#c5cada]">|</span>
            <input className="ml-3 min-w-0 flex-1 bg-transparent text-[#37405a] outline-none" onChange={(e) => onProfileFieldChange("phoneNumber", e.target.value)} placeholder="phone number" type="tel" value={profileForm.phoneNumber} />
          </div>
        </label>

        <label className="mt-2.5 block">
          <FieldLabel>Bio</FieldLabel>
          <textarea className="mt-1 h-20 w-full resize-none rounded-lg border border-[#d8dde8] bg-white px-3 py-2 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("bio", e.target.value)} placeholder="Tell us about yourself..." value={profileForm.bio} />
          <span className="mt-1 block text-[0.64rem] text-[#98a0b3]">Bio must be at least 10 characters</span>
        </label>

        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label><FieldLabel>Password</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("password", e.target.value)} type="password" value={profileForm.password} /></label>
          <label><FieldLabel>Confirm Password</FieldLabel><input className="mt-1 h-9 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onProfileFieldChange("confirmPassword", e.target.value)} type="password" value={profileForm.confirmPassword} /></label>
        </div>

        <div className="mt-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <span className="text-[0.66rem] text-[#8c93a7]">must be at least 8 characters</span>
          <span className="text-[0.66rem] text-[#8c93a7]">must be at least 8 characters</span>
        </div>
      </form>
    </section>
  );
}
