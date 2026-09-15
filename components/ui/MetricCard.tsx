import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, icon, className = "" }: MetricCardProps) {
  return (
    <article className={`rounded-[var(--ui-radius-md)] border border-ui-border bg-brand-card px-3.5 py-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ui-body">{label}</p>
          <p className="mt-1 truncate text-base font-semibold text-ui-title sm:text-lg">{value}</p>
        </div>
        {icon ? <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f5f7fc]">{icon}</span> : null}
      </div>
    </article>
  );
}
