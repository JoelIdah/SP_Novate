"use client";

import { ChatConnection } from "../chat/ChatConnection";
import ChatWorkspace from "../chat/ChatWorkspace";
import { TutorNavbar } from "./TutorNavbar";

export default function TutorChatPage() {
  return (
    <ChatConnection>
      <ChatWorkspace navbar={<TutorNavbar active="Chat" />} />
    </ChatConnection>
  );
}
