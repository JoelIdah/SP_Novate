import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  const classes = `rounded-[0.9rem] border border-[#e3e7ef] bg-white ${className}`.trim();
  return <div className={classes} {...props} />;
}
