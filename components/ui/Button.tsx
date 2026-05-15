import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
};

export function Button({ variant, className = "", type = "button", ...props }: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "rounded-full border border-[#2f2b88] bg-[#2b276f] text-white"
      : "rounded-full border border-[#dfe4ee] bg-[#f7f7f8] text-[#5a6174]";
  const classes = `${variantClass} ${className}`.trim();

  return <button className={classes} type={type} {...props} />;
}
