import type { ReactNode } from "react";

export function DashboardSectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold text-[#616a82]">{title}</h2>
      {action}
    </div>
  );
}

export function DashboardActionCard({ icon, title, description, toneClassName }: { icon: ReactNode; title: string; description: string; toneClassName: string }) {
  return (
    <article className={`flex min-h-20 items-center rounded-xl border px-3.5 py-3 ${toneClassName}`}>
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <p className="text-base font-semibold text-[#2b3350]">{title}</p>
          <p className="mt-1 text-xs leading-snug text-[#6d758e]">{description}</p>
        </div>
      </div>
    </article>
  );
}

export function DashboardResourceCard({ title, description, toneClassName, markerClassName }: { title: string; description: string; toneClassName: string; markerClassName?: string }) {
  return (
    <article className={`min-h-28 rounded-xl border p-3.5 ${toneClassName}`}>
      {markerClassName ? <span aria-hidden className={`inline-block h-3 w-3 rounded-full ${markerClassName}`} /> : null}
      <p className={`${markerClassName ? "mt-2" : ""} text-base font-semibold text-[#2d3448]`}>{title}</p>
      <p className="mt-1 text-sm text-[#5c6884]">{description}</p>
      <button className="mt-3 min-h-9 rounded-full border border-[#54607b] bg-white px-4 text-xs font-semibold text-[#2d3448]" type="button">Watch video</button>
    </article>
  );
}
