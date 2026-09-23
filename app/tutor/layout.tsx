import type { ReactNode } from "react";

import { SignedInLayout } from "../../components/auth/SignedInLayout";

export default function TutorLayout({ children }: { children: ReactNode }) {
  return <SignedInLayout protectTutorArea>{children}</SignedInLayout>;
}
