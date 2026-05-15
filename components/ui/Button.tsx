import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
};

export function Button({ variant, className = "", type = "button", ...props }: ButtonProps) {
  const variantClass = variant === "primary" ? "ui-btn-primary" : "ui-btn-secondary";
  const classes = `${variantClass} ${className}`.trim();

  return <button className={classes} type={type} {...props} />;
}
