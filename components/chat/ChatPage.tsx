"use client";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { ChatConnection } from "./ChatConnection";
import ChatWorkspace from "./ChatWorkspace";

export default function ChatPage({ initialRecipientPublicId }: { initialRecipientPublicId?: string }) {
  return (
    <ChatConnection>
      <ChatWorkspace initialRecipientPublicId={initialRecipientPublicId} navbar={<StudentDashboardNavbar active="Chat" />} />
    </ChatConnection>
  );
}
