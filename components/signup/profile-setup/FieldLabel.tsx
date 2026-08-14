import type { ReactNode } from "react";

export function FieldLabel({ children, optional = false, required = false }: { children: ReactNode; optional?: boolean; required?: boolean }) {
  return (
    <span className="text-sm font-semibold text-[#5d6479]">
      {children}
      {required ? <span className="ml-0.5 text-brand-danger" aria-hidden>*</span> : null}
      {optional ? <span className="ml-1 text-xs font-medium text-[#9299aa]">(optional)</span> : null}
    </span>
  );
}

