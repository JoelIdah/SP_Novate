"use client";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import ChatWorkspace from "./ChatWorkspace";

export default function ChatPage() {
  return <ChatWorkspace navbar={<StudentDashboardNavbar active="Chat" />} role="student" />;
}
