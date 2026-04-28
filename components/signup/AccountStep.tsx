import Link from "next/link";

import { AppleIcon, FacebookIcon, GoogleIcon } from "./icons";

export function AccountStep({ onContinue }: { onContinue: () => void }) {
  return (
    <form
      className="mx-auto mt-6 w-full max-w-[20.5rem] sm:max-w-[21rem]"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <div className="space-y-3">
        <label className="block text-[0.74rem] font-semibold text-[#6f778c]">
          Email
          <input className="mt-1.5 h-9 w-full rounded-[0.45rem] border border-[#d8dde8] px-3 text-[0.77rem] font-semibold text-[#4f5980] outline-none focus:border-[#b6c0d8]" defaultValue="Oluyinka@gmail.com" type="email" />
        </label>
        <label className="block text-[0.74rem] font-semibold text-[#6f778c]">
          Last name
          <input className="mt-1.5 h-9 w-full rounded-[0.45rem] border border-[#d8dde8] px-3 text-[0.77rem] font-semibold text-[#4f5980] outline-none focus:border-[#b6c0d8]" defaultValue="Alabi" type="text" />
        </label>
        <label className="block text-[0.74rem] font-semibold text-[#6f778c]">
          First Name
          <input className="mt-1.5 h-9 w-full rounded-[0.45rem] border border-[#d8dde8] px-3 text-[0.77rem] font-semibold text-[#4f5980] outline-none focus:border-[#b6c0d8]" defaultValue="Oluyinka" type="text" />
        </label>
      </div>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#d9deea]" />
        <span className="text-[0.7rem] font-semibold uppercase text-[#9ba2b4]">or continue with</span>
        <span className="h-px flex-1 bg-[#d9deea]" />
      </div>

      <div className="space-y-2.5">
        <button className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379]" type="button">
          <GoogleIcon />
          Continue with Google
        </button>
        <button className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379]" type="button">
          <FacebookIcon />
          Continue with Facebook
        </button>
        <button className="flex h-9 w-full items-center justify-center gap-2 rounded-[0.45rem] border border-[#d5dae7] bg-white text-[0.86rem] font-semibold text-[#596379]" type="button">
          <AppleIcon />
          Continue with Apple
        </button>
      </div>

      <button className="mt-4.5 h-10 w-full rounded-full bg-[#231d71] text-[0.84rem] font-semibold text-white hover:bg-[#1c175f]" type="submit">
        Create an account
      </button>

      <p className="mx-auto mt-4 max-w-[17rem] text-center text-[0.7rem] font-medium leading-[1.45] text-[#8e95a8]">
        By continuing you accept the <Link href="#" className="underline">Term of Use</Link> and <Link href="#" className="underline">Privacy Policy</Link>
      </p>
    </form>
  );
}
