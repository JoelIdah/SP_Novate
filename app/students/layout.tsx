import type { ReactNode } from "react";

import { SignedInLayout } from "../../components/auth/SignedInLayout";

export default function StudentsLayout({ children }: { children: ReactNode }) {
  return <SignedInLayout>{children}</SignedInLayout>;
}
