import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-brand-primary bg-brand-primary text-white hover:bg-[#1c175f]",
  secondary: "border-ui-border bg-white text-ui-body hover:bg-[#f7f8fb]",
  ghost: "border-transparent bg-transparent text-ui-body hover:bg-brand-primary-soft",
  danger: "border-brand-danger bg-brand-danger text-white hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-sm",
};

export function Button({ variant, size = "md", className = "", type = "button", ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  return <button className={classes} type={type} {...props} />;
}

