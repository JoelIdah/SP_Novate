const toneClasses = {
  success: "bg-brand-success",
  warning: "bg-[#d6a91f]",
  danger: "bg-brand-danger",
  info: "bg-[#2187d3]",
  accent: "bg-brand-accent",
  neutral: "bg-[#8a92a6]",
} as const;

export type StatusTone = keyof typeof toneClasses;

export function StatusIndicator({ label, tone = "neutral", className = "" }: { label: string; tone?: StatusTone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-ui-body ${className}`}>
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${toneClasses[tone]}`} />
      <span>{label}</span>
    </span>
  );
}
