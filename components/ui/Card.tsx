import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  const classes = `rounded-[var(--ui-card-radius)] border border-ui-border bg-brand-card ${className}`.trim();
  return <div className={classes} {...props} />;
}

