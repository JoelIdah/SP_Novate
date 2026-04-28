import Image from "next/image";
import Link from "next/link";

export function AuthCardHeader() {
  return (
    <>
      <div className="absolute left-1/2 -top-7 -translate-x-1/2 sm:-top-8">
        <div className="overflow-hidden rounded-[0.7rem] shadow-[0_9px_20px_rgba(53,49,177,0.25)]">
          <Image
            alt="SP Novate"
            className="h-[52px] w-auto sm:h-[56px]"
            height={56}
            priority
            src="/logo/logo.png"
            width={56}
          />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-[1.85rem] font-bold tracking-[-0.02em] text-[#1d2230] sm:text-[2rem]">
          Create an account
        </h1>
        <p className="mt-1.5 text-[0.77rem] font-medium text-[#8d95a8] sm:text-[0.79rem]">
          Already have an account?{" "}
          <Link href="#" className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]">
            Log In
          </Link>
        </p>
      </div>
    </>
  );
}
