"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { redirectToLoginForAuthentication, useSessionUser } from "../auth/authSession";

export type ChatSidebarItem = {
  conversation_public_id: string;
  last_message: string;
  last_message_is_read: boolean;
  last_message_time: string;
  name: string;
  profile_photo: string;
  unread_count: number;
};

export type ChatMessage = {
  attachments?: Array<{ file_name: string; type: "file" | "image"; url: string }>;
  content: string;
  conversation_public_id: string;
  has_sensitive?: boolean;
  profile_photo?: string;
  public_id: string;
  sender_public_id: string;
  status: "sent" | "delivered" | "read";
  time: string;
};

export type ChatConversation = {
  conversation_public_id: string;
  messages: ChatMessage[];
  other_user: {
    name: string;
    online: boolean;
    profile_photo: string;
    public_id: string;
  };
};

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type ChatContextValue = {
  connectionStatus: ConnectionStatus;
  conversations: Record<string, ChatConversation>;
  error: string;
  newConversation: { id: string; recipientPublicId: string } | null;
  sidebar: ChatSidebarItem[];
  clearError: () => void;
  loadConversation: (conversationPublicId: string) => boolean;
  refreshSidebar: () => boolean;
  sendMessage: (input: {
    content: string;
    conversationPublicId?: string;
    recipientPublicId?: string;
  }) => boolean;
};

type SocketEvent = { event?: unknown; data?: unknown };
type ConnectionPayload = { token?: unknown; websocketUrl?: unknown; message?: unknown };

const ChatContext = createContext<ChatContextValue | null>(null);
const reconnectDelay = 2000;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function appendToken(url: string, token: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export function ChatConnection({ children }: { children: ReactNode }) {
  const sessionUser = useSessionUser();
  const socketRef = useRef<WebSocket | null>(null);
  const awaitingNewConversationRef = useRef("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [sidebar, setSidebar] = useState<ChatSidebarItem[]>([]);
  const [conversations, setConversations] = useState<Record<string, ChatConversation>>({});
  const [newConversation, setNewConversation] = useState<{
    id: string;
    recipientPublicId: string;
  } | null>(null);
  const [error, setError] = useState("");

  const sendEvent = useCallback((event: string, data: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Chat is reconnecting. Please try again in a moment.");
      return false;
    }
    socket.send(JSON.stringify({ event, data }));
    return true;
  }, []);

  const refreshSidebar = useCallback(
    () => sendEvent("chat.get_sidebar", {}),
    [sendEvent],
  );

  const loadConversation = useCallback(
    (conversationPublicId: string) =>
      sendEvent("chat.get_conversation", {
        conversation_public_id: conversationPublicId,
      }),
    [sendEvent],
  );

  const sendMessage = useCallback(
    ({ content, conversationPublicId, recipientPublicId }: {
      content: string;
      conversationPublicId?: string;
      recipientPublicId?: string;
    }) => {
      const data: Record<string, unknown> = { content };
      if (conversationPublicId) data.conversation_public_id = conversationPublicId;
      if (!conversationPublicId && recipientPublicId) {
        data.recipient_public_id = recipientPublicId;
        awaitingNewConversationRef.current = recipientPublicId;
      }
      const sent = sendEvent("chat.send_message", data);
      if (!sent) awaitingNewConversationRef.current = "";
      return sent;
    },
    [sendEvent],
  );

  useEffect(() => {
    let stopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer) return;
      setConnectionStatus("disconnected");
      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        void connect();
      }, reconnectDelay);
    };

    const handleEvent = (payload: SocketEvent) => {
      if (typeof payload.event !== "string") return;

      if (payload.event === "chat.sidebar" && Array.isArray(payload.data)) {
        setSidebar(payload.data as ChatSidebarItem[]);
        return;
      }

      if (payload.event === "chat.conversation" && isObject(payload.data)) {
        const conversation = payload.data as ChatConversation;
        if (typeof conversation.conversation_public_id !== "string") return;
        setConversations((current) => ({
          ...current,
          [conversation.conversation_public_id]: conversation,
        }));
        return;
      }

      if (payload.event === "chat.message" && isObject(payload.data)) {
        const message = payload.data as ChatMessage;
        if (!message.conversation_public_id || !message.public_id) return;
        setConversations((current) => {
          const conversation = current[message.conversation_public_id];
          if (!conversation || conversation.messages.some((item) => item.public_id === message.public_id)) {
            return current;
          }
          return {
            ...current,
            [message.conversation_public_id]: {
              ...conversation,
              messages: [...conversation.messages, message],
            },
          };
        });
        setSidebar((current) => {
          const index = current.findIndex(
            (item) => item.conversation_public_id === message.conversation_public_id,
          );
          if (index < 0) return current;
          const updated = {
            ...current[index],
            last_message: message.content,
            last_message_time: message.time,
          };
          return [updated, ...current.filter((_, itemIndex) => itemIndex !== index)];
        });
        if (
          Boolean(awaitingNewConversationRef.current) &&
          message.sender_public_id === sessionUser?.publicId
        ) {
          const recipientPublicId = awaitingNewConversationRef.current;
          awaitingNewConversationRef.current = "";
          setNewConversation({ id: message.conversation_public_id, recipientPublicId });
          socketRef.current?.send(JSON.stringify({
            event: "chat.get_conversation",
            data: { conversation_public_id: message.conversation_public_id },
          }));
          refreshSidebar();
        }
        return;
      }

      if (payload.event === "chat.unread_count" && isObject(payload.data)) {
        const conversationId = payload.data.conversation_public_id;
        const unreadCount = payload.data.unread_count;
        if (typeof conversationId !== "string" || typeof unreadCount !== "number") return;
        setSidebar((current) => current.map((item) =>
          item.conversation_public_id === conversationId
            ? { ...item, unread_count: unreadCount }
            : item
        ));
        return;
      }

      if (payload.event === "chat.read" && isObject(payload.data)) {
        const conversationId = payload.data.conversation_public_id;
        const messageIds = payload.data.message_public_ids;
        if (typeof conversationId !== "string" || !Array.isArray(messageIds)) return;
        const readIds = new Set(messageIds.filter((id): id is string => typeof id === "string"));
        setConversations((current) => {
          const conversation = current[conversationId];
          if (!conversation) return current;
          return {
            ...current,
            [conversationId]: {
              ...conversation,
              messages: conversation.messages.map((message) =>
                readIds.has(message.public_id) ? { ...message, status: "read" } : message
              ),
            },
          };
        });
        return;
      }

      if (payload.event === "chat.presence" && isObject(payload.data)) {
        const userId = payload.data.user_public_id;
        const online = payload.data.online;
        if (typeof userId !== "string" || typeof online !== "boolean") return;
        setConversations((current) => Object.fromEntries(
          Object.entries(current).map(([id, conversation]) => [
            id,
            conversation.other_user.public_id === userId
              ? { ...conversation, other_user: { ...conversation.other_user, online } }
              : conversation,
          ]),
        ));
        return;
      }

      if (payload.event === "error") {
        setError(typeof payload.data === "string" ? payload.data : "The chat request failed.");
      }
    };

    const connect = async () => {
      setConnectionStatus("connecting");
      try {
        const response = await fetch("/api/auth/chat-connection", {
          method: "POST",
          cache: "no-store",
        });
        const payload = await response.json().catch(() => null) as ConnectionPayload | null;
        if (response.status === 401) {
          redirectToLoginForAuthentication();
          return;
        }
        if (!response.ok) {
          throw new Error(
            typeof payload?.message === "string" ? payload.message : "Chat connection failed.",
          );
        }
        const token = typeof payload?.token === "string" ? payload.token : "";
        const websocketUrl = typeof payload?.websocketUrl === "string" ? payload.websocketUrl : "";
        if (!token || !websocketUrl || stopped) return;

        const socket = new WebSocket(appendToken(websocketUrl, token));
        socketRef.current = socket;
        socket.onopen = () => {
          if (stopped) return;
          setConnectionStatus("connected");
          setError("");
          socket.send(JSON.stringify({ event: "chat.get_sidebar", data: {} }));
        };
        socket.onmessage = (message) => {
          try {
            handleEvent(JSON.parse(String(message.data)) as SocketEvent);
          } catch {
            setError("Chat returned an unreadable response.");
          }
        };
        socket.onerror = () => setError("The live chat connection was interrupted.");
        socket.onclose = () => {
          if (socketRef.current === socket) socketRef.current = null;
          scheduleReconnect();
        };
      } catch (connectionError) {
        if (stopped) return;
        setError(connectionError instanceof Error ? connectionError.message : "Chat connection failed.");
        scheduleReconnect();
      }
    };

    void connect();
    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const socket = socketRef.current;
      socketRef.current = null;
      socket?.close();
    };
  }, [refreshSidebar, sessionUser?.publicId]);

  const value = useMemo<ChatContextValue>(() => ({
    connectionStatus,
    conversations,
    error,
    newConversation,
    sidebar,
    clearError: () => setError(""),
    loadConversation,
    refreshSidebar,
    sendMessage,
  }), [
    connectionStatus,
    conversations,
    error,
    loadConversation,
    newConversation,
    refreshSidebar,
    sendMessage,
    sidebar,
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatConnection() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatConnection must be used inside ChatConnection.");
  return context;
}
