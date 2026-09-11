"use client";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import ChatWorkspace from "./ChatWorkspace";

export default function ChatPage({ initialRecipientPublicId }: { initialRecipientPublicId?: string }) {
  return <ChatWorkspace initialRecipientPublicId={initialRecipientPublicId} navbar={<StudentDashboardNavbar active="Chat" />} />;
}
