import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  const classes = `ui-card ${className}`.trim();
  return <div className={classes} {...props} />;
}
