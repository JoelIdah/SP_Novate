"use client";

import { ArrowLeft, Search, SendHorizontal } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useSessionUser } from "../auth/authSession";
import { Avatar } from "../ui/Avatar";
import { useChatConnection, type ChatSidebarItem } from "./ChatConnection";

type ChatWorkspaceProps = {
  navbar: ReactNode;
  initialRecipientPublicId?: string;
};

const palette = ["#145b54", "#1b6b63", "#0f5b55", "#25625d", "#185f57"];

function initialsFromName(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function colorFromName(name: string) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function ContactAvatar({ name, photo, size = "h-7 w-7" }: { name: string; photo?: string; size?: string }) {
  return <Avatar alt={name} className={`${size} shrink-0 overflow-hidden rounded-md text-white`} initials={initialsFromName(name)} src={photo || undefined} style={{ backgroundColor: colorFromName(name) }} />;
}

export default function ChatWorkspace({ navbar, initialRecipientPublicId }: ChatWorkspaceProps) {
  const sessionUser = useSessionUser();
  const { connectionStatus, conversations, error, newConversation, sidebar, clearError, loadConversation, sendMessage } = useChatConnection();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatClosed, setChatClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [composer, setComposer] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const createdConversationId = newConversation?.recipientPublicId === initialRecipientPublicId
    ? newConversation?.id ?? ""
    : "";
  const activeConversationId = chatClosed
    ? null
    : (selectedConversationId ?? (createdConversationId || null));
  const activeSidebarItem = sidebar.find((item) => item.conversation_public_id === activeConversationId);
  const activeConversation = activeConversationId ? conversations[activeConversationId] : undefined;
  const isNewConversation = Boolean(initialRecipientPublicId && !activeConversationId);
  const hasOpenConversation = Boolean(activeConversationId || isNewConversation);
  const activeName = activeConversation?.other_user.name ?? activeSidebarItem?.name ?? "New conversation";
  const activePhoto = activeConversation?.other_user.profile_photo ?? activeSidebarItem?.profile_photo;
  const filteredSidebar = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? sidebar.filter((item) => [item.name, item.last_message].some((value) => value.toLowerCase().includes(query))) : sidebar;
  }, [searchQuery, sidebar]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeConversationId, activeConversation?.messages.length]);

  const selectConversation = (item: ChatSidebarItem) => {
    setSelectedConversationId(item.conversation_public_id);
    setChatClosed(false);
    clearError();
    loadConversation(item.conversation_public_id);
  };

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = composer.trim();
    if (!content) return;
    const sent = sendMessage({ content, conversationPublicId: activeConversationId ?? undefined, recipientPublicId: activeConversationId ? undefined : initialRecipientPublicId });
    if (sent) setComposer("");
  };

  return (
    <main className="dashboard-screen overflow-hidden bg-brand-surface text-brand-ink">
      <div className="dashboard-shell bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-pattern.png')" }}>
        {navbar}
        <section className="dashboard-main p-0">
          <div className="dashboard-content-frame h-full px-3 py-3 sm:px-4 sm:py-4 md:px-5">
            {error ? <div className="mb-3 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert"><span>{error}</span><button className="font-semibold" onClick={clearError} type="button">Dismiss</button></div> : null}
            <section className="grid h-full min-h-0 w-full gap-4 xl:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)] xl:gap-5">
              <aside className={`${hasOpenConversation ? "hidden xl:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-ui-border bg-white shadow-[var(--ui-shadow-card)]`}>
                <div className="flex items-center justify-between border-b border-[#edf0f6] px-4 py-4">
                  <h1 className="text-[1rem] font-medium text-[#858ea2]">Chat</h1>
                  <span className={`text-[0.65rem] font-semibold ${connectionStatus === "connected" ? "text-brand-success" : "text-[#9a7314]"}`}>{connectionStatus === "connected" ? "Live" : connectionStatus === "connecting" ? "Connecting…" : "Reconnecting…"}</span>
                </div>
                <div className="border-b border-[#edf0f6] px-4 py-3">
                  <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#aeb6c7]" /><input className="min-h-11 w-full rounded-full border border-ui-border bg-white pl-9 pr-3 text-sm text-ui-body outline-none placeholder:text-[#b1b8c8] focus:border-brand-accent md:min-h-10" onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search conversations" type="search" value={searchQuery} /></label>
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto">
                  {filteredSidebar.map((item) => {
                    const active = activeConversationId === item.conversation_public_id;
                    return <button className={`relative flex w-full items-center gap-2 border-b border-[#e6eaf2] px-3 py-2.5 text-left ${active ? "bg-[#f4f5ff]" : "bg-white hover:bg-[#fafbff]"}`} key={item.conversation_public_id} onClick={() => selectConversation(item)} type="button">
                      {active ? <span className="absolute bottom-1.5 left-0 top-1.5 w-1 rounded-r-full bg-[#4b49d8]" /> : null}
                      <ContactAvatar name={item.name} photo={item.profile_photo} />
                      <div className="min-w-0 flex-1"><p className="truncate text-[0.76rem] font-semibold text-[#222838]">{item.name}</p><p className="truncate text-[0.62rem] text-[#6f7891]">{item.last_message}</p></div>
                      <div className="flex shrink-0 flex-col items-end gap-1"><span className="text-[0.58rem] font-semibold text-[#2f3547]">{item.last_message_time}</span>{item.unread_count > 0 ? <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3635ba] px-1 text-[0.52rem] font-bold text-white">{item.unread_count}</span> : <span className="h-4 min-w-4" />}</div>
                    </button>;
                  })}
                  {filteredSidebar.length === 0 ? <div className="px-4 py-10 text-center"><p className="text-sm font-semibold text-[#596176]">{connectionStatus === "connected" ? "No conversations yet" : "Connecting to chat…"}</p><p className="mt-1 text-xs text-[#8b93a7]">Your conversations will appear here.</p></div> : null}
                </div>
              </aside>

              <section className={`${hasOpenConversation ? "flex" : "hidden xl:flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-ui-border bg-white shadow-[var(--ui-shadow-card)]`}>
                {hasOpenConversation ? <>
                  <header className="flex h-[4.4rem] items-center justify-between border-b border-[#edf0f6] px-4">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3"><button aria-label="Back to chats" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#4f576d] hover:bg-[#f1f3f8] xl:hidden" onClick={() => setChatClosed(true)} type="button"><ArrowLeft className="h-4 w-4" /></button><ContactAvatar name={activeName} photo={activePhoto} size="h-8 w-8" /><p className="truncate text-[1rem] font-semibold text-[#222838]">{activeName}</p></div>
                    {activeConversation ? <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${activeConversation.other_user.online ? "bg-[#e8fbf1] text-brand-success" : "bg-[#f2f3f7] text-[#7a8297]"}`}><span className={`h-1.5 w-1.5 rounded-full ${activeConversation.other_user.online ? "bg-brand-success" : "bg-[#9aa1b2]"}`} />{activeConversation.other_user.online ? "Online" : "Offline"}</span> : null}
                  </header>
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-6" aria-live="polite">
                    {activeConversation?.messages.map((message) => {
                      const isOwnMessage = message.sender_public_id === sessionUser?.publicId;
                      const ownName = `${sessionUser?.firstName ?? ""} ${sessionUser?.lastName ?? ""}`.trim() || "You";
                      return <div className={`mt-5 flex items-end gap-2 first:mt-0 ${isOwnMessage ? "flex-row-reverse" : ""}`} key={message.public_id}><ContactAvatar name={isOwnMessage ? ownName : activeName} photo={isOwnMessage ? sessionUser?.profilePhoto : message.profile_photo || activePhoto} size="h-7 w-7" /><div className={`max-w-[min(28rem,78%)] ${isOwnMessage ? "text-right" : ""}`}><p className={`break-words rounded-lg px-4 py-2 text-left text-[0.78rem] font-medium ${isOwnMessage ? "bg-[#4b49d8] text-white" : "bg-[#d9d9f6] text-[#4d5395]"}`}>{message.content}</p><span className="mt-1 block text-[0.58rem] text-[#9299aa]">{message.time}{isOwnMessage ? ` · ${message.status}` : ""}</span></div></div>;
                    })}
                    {!activeConversation && activeConversationId ? <p className="py-8 text-center text-sm text-[#8b93a7]">Loading conversation…</p> : null}
                    {isNewConversation ? <p className="py-8 text-center text-sm text-[#8b93a7]">Send a message to start this conversation.</p> : null}
                    <div ref={messageEndRef} />
                  </div>
                  <form className="border-t border-[#edf0f6] bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-4" onSubmit={submitMessage}><div className="flex items-center gap-2 sm:gap-3"><input aria-label="Message" className="min-h-11 min-w-0 flex-1 rounded-full border border-ui-border bg-brand-primary-soft px-4 text-sm text-[#4d5395] outline-none placeholder:text-[#7e84ad] focus:border-brand-accent" onChange={(event) => setComposer(event.target.value)} placeholder={`Message ${activeName}`} type="text" value={composer} /><button aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-success text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!composer.trim() || connectionStatus !== "connected"} type="submit"><SendHorizontal className="h-4 w-4" fill="currentColor" strokeWidth={2.5} /></button></div></form>
                </> : <div className="flex h-full items-center justify-center px-6 text-center"><div><p className="text-base font-semibold text-[#4b5368]">Select a conversation</p><p className="mt-1 text-sm text-[#8b93a7]">Choose someone from the list to view your messages.</p></div></div>}
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
