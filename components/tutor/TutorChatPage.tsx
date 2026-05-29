"use client";

import ChatWorkspace from "../chat/ChatWorkspace";
import { TutorNavbar } from "./TutorNavbar";

export default function TutorChatPage() {
  return <ChatWorkspace navbar={<TutorNavbar active="Chat" />} role="tutor" />;
}
