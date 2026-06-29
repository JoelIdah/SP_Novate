import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold text-[#5d6479]">{children}</span>;
}

