import type { HTMLAttributes } from "react";

type NoticeTone = "error" | "info" | "success" | "warning";

const toneClasses: Record<NoticeTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-[#f0d6b5] bg-[#fff9f1] text-[#8b5a20]",
};

type NoticeProps = HTMLAttributes<HTMLDivElement> & {
  tone?: NoticeTone;
};

export function Notice({
  children,
  className = "",
  role = "status",
  tone = "warning",
  ...props
}: NoticeProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 font-medium leading-relaxed ${toneClasses[tone]} ${className}`.trim()}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
}
