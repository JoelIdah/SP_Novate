import type { ReactNode } from "react";

import { ProtectedAppLayout } from "../../components/auth/ProtectedAppLayout";

export default function TutorLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppLayout>{children}</ProtectedAppLayout>;
}
