import type { ReactNode } from "react";
import Link from "next/link";

export function DashboardSectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-[#3f4860]">{title}</h2>
      {action}
    </div>
  );
}

export function DashboardActionCard({ icon, title, description, toneClassName, href }: { icon: ReactNode; title: string; description: string; toneClassName: string; href?: string }) {
  const content = (
      <div className="flex items-center gap-4">
        {icon}
        <div className="min-w-0">
          <p className="text-[1.05rem] font-bold text-[#252d49]">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#59647e]">{description}</p>
        </div>
      </div>
  );

  const className = `flex min-h-28 items-center rounded-2xl border-2 px-5 py-4 shadow-[0_8px_22px_rgba(31,40,74,0.07)] ${toneClassName}${href ? " transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(31,40,74,0.13)] focus-visible:outline-offset-2" : ""}`;

  return href ? <Link className={className} href={href}>{content}</Link> : <article className={className}>{content}</article>;
}

export function DashboardResourceCard({ title, description, toneClassName, markerClassName }: { title: string; description: string; toneClassName: string; markerClassName?: string }) {
  return (
    <article className={`min-h-28 rounded-xl border p-4 ${toneClassName}`}>
      {markerClassName ? <span aria-hidden className={`inline-block h-3 w-3 rounded-full ${markerClassName}`} /> : null}
      <p className={`${markerClassName ? "mt-2" : ""} text-base font-semibold text-[#2d3448]`}>{title}</p>
      <p className="mt-1 text-sm text-[#5c6884]">{description}</p>
      <button className="mt-3 min-h-9 rounded-full border border-[#54607b] bg-white px-4 text-xs font-semibold text-[#2d3448]" type="button">Watch video</button>
    </article>
  );
}
