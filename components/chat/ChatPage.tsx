"use client";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import ChatWorkspace from "./ChatWorkspace";

export default function ChatPage({ initialContactId }: { initialContactId?: number }) {
  return <ChatWorkspace initialContactId={initialContactId} navbar={<StudentDashboardNavbar active="Chat" />} role="student" />;
}
