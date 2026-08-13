"use client";

import { ArrowLeft, Plus, Search, SendHorizontal } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Avatar } from "../ui/Avatar";

type ChatRole = "student" | "tutor";

type ChatContact = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  avatar?: "photo" | "initials";
};

type ChatMessage = {
  id: number;
  author: "student" | "tutor";
  text: string;
};

type ChatWorkspaceProps = {
  role: ChatRole;
  navbar: ReactNode;
  initialContactId?: number;
};

const tutorContacts: ChatContact[] = [
  { id: 1, name: "Ekene Ezegbunam", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "photo" },
  { id: 2, name: "Akin-akintaylor Akinbowale", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1 },
  { id: 3, name: "Quadri Ahmed", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1 },
  { id: 4, name: "Regina Akpan", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { id: 5, name: "David Lawal", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { id: 6, name: "Elizabeth Obi", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 2 },
  { id: 7, name: "Doris Irabor", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { id: 8, name: "Catherine Isime", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { id: 9, name: "Abolarinde Cole", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { id: 10, name: "Edward Samuel", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1 },
  { id: 11, name: "Edward Samuel", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1 },
];

const studentContacts: ChatContact[] = [
  { id: 1, name: "Oluyinka Emmanuel", preview: "Great Kene. please what day works for you", time: "11:25", unread: 1, avatar: "photo" },
  { id: 2, name: "Akin-akintaylor Akinbowale", preview: "Great, please what day works for you", time: "11:25", unread: 1 },
  { id: 3, name: "Quadri Ahmed", preview: "Great, please what day works for you", time: "11:25", unread: 1 },
  { id: 4, name: "Regina Akpan", preview: "Great, please what day works for you", time: "11:25" },
  { id: 5, name: "David Lawal", preview: "Great, please what day works for you", time: "11:25" },
  { id: 6, name: "Elizabeth Obi", preview: "Great, please what day works for you", time: "11:25", unread: 2 },
  { id: 7, name: "Doris Irabor", preview: "Great, please what day works for you", time: "11:25" },
  { id: 8, name: "Catherine Isime", preview: "Great, please what day works for you", time: "11:25" },
  { id: 9, name: "Abolarinde Cole", preview: "Great, please what day works for you", time: "11:25" },
  { id: 10, name: "Edward Samuel", preview: "Great, please what day works for you", time: "11:25", unread: 1 },
  { id: 11, name: "Edward Samuel", preview: "Great, please what day works for you", time: "11:25", unread: 1 },
];

const messages: ChatMessage[] = [
  { id: 1, author: "student", text: "Hi Oluyinka, I would love to book a session." },
  { id: 2, author: "tutor", text: "Great Kene. please what day works for you" },
  { id: 3, author: "student", text: "Wednesday's 10 am" },
];

const palette = ["#145b54", "#1b6b63", "#0f5b55", "#25625d", "#185f57"];

function initialsFromName(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function colorFromName(name: string) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function ContactAvatar({ contact, size = "h-7 w-7" }: { contact: ChatContact; size?: string }) {
  if (contact.avatar === "photo") {
    return (
      <Avatar
        alt={contact.name}
        className={`${size} shrink-0 overflow-hidden rounded-md`}
        randomImage
        randomSeed={contact.name}
      />
    );
  }

  return (
    <Avatar
      alt={contact.name}
      className={`${size} shrink-0 rounded-md text-white`}
      initials={initialsFromName(contact.name)}
      style={{ backgroundColor: colorFromName(contact.name) }}
    />
  );
}

function createInitialHistory(contacts: ChatContact[], role: ChatRole) {
  const otherRole: ChatRole = role === "student" ? "tutor" : "student";
  return Object.fromEntries(
    contacts.map((contact) => [
      contact.id,
      contact.id === 1 ? messages : [{ id: 1, author: otherRole, text: contact.preview }],
    ])
  ) as Record<number, ChatMessage[]>;
}

export default function ChatWorkspace({ role, navbar, initialContactId }: ChatWorkspaceProps) {
  const initialContacts = role === "tutor" ? tutorContacts : studentContacts;
  const validInitialContact = initialContacts.some((contact) => contact.id === initialContactId) ? initialContactId ?? null : null;
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState<number | null>(validInitialContact);
  const [searchQuery, setSearchQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [messageHistory, setMessageHistory] = useState<Record<number, ChatMessage[]>>(() => createInitialHistory(initialContacts, role));
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0];
  const activeMessages = messageHistory[activeContact.id] ?? [];
  const searchPlaceholder = role === "tutor" ? "Search for students" : "Search for tutors";
  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? contacts.filter((contact) => [contact.name, contact.preview].some((value) => value.toLowerCase().includes(query))) : contacts;
  }, [contacts, searchQuery]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeContactId, activeMessages.length]);

  const selectContact = (contactId: number) => {
    setActiveContactId(contactId);
    setContacts((current) => current.map((contact) => contact.id === contactId ? { ...contact, unread: undefined } : contact));
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = composer.trim() || (attachmentName ? `Attachment: ${attachmentName}` : "");
    if (!text) return;

    setMessageHistory((current) => ({
      ...current,
      [activeContact.id]: [...(current[activeContact.id] ?? []), { id: Date.now(), author: role, text }],
    }));
    setContacts((current) => current.map((contact) => contact.id === activeContact.id ? { ...contact, preview: text, time: "Now", unread: undefined } : contact));
    setComposer("");
    setAttachmentName("");
  };

  return (
    <main className="dashboard-screen overflow-hidden bg-brand-surface text-brand-ink">
      <div className="dashboard-shell bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-pattern.png')" }}>
        {navbar}

        <section className="dashboard-main p-0">
          <div className="dashboard-content-frame h-full px-3 py-3 sm:px-4 sm:py-4 md:px-5">
            <section className="grid h-full min-h-0 w-full gap-4 xl:grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)] xl:gap-5">
              <aside className={`${activeContactId ? "hidden xl:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-ui-border bg-white shadow-[var(--ui-shadow-card)]`}>
                <div className="border-b border-[#edf0f6] px-4 py-4">
                  <h1 className="text-[1rem] font-medium text-[#858ea2]">Chat</h1>
                </div>

                <div className="border-b border-[#edf0f6] px-4 py-3">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#aeb6c7]" />
                    <input
                      className="min-h-11 w-full rounded-full border border-ui-border bg-white pl-9 pr-3 text-sm text-ui-body outline-none placeholder:text-[#b1b8c8] focus:border-brand-accent md:min-h-10"
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      type="search"
                      value={searchQuery}
                    />
                  </label>
                </div>

                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto">
                  {filteredContacts.map((contact) => {
                    const active = activeContactId === contact.id;
                    return (
                      <button
                        key={`${contact.name}-${contact.id}`}
                        className={`relative flex w-full items-center gap-2 border-b border-[#e6eaf2] px-3 py-2.5 text-left ${
                          active ? "bg-[#f4f5ff]" : "bg-white hover:bg-[#fafbff]"
                        }`}
                        onClick={() => selectContact(contact.id)}
                        type="button"
                      >
                        {active ? <span className="absolute bottom-1.5 left-0 top-1.5 w-1 rounded-r-full bg-[#4b49d8]" /> : null}
                        <ContactAvatar contact={contact} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.76rem] font-semibold text-[#222838]">{contact.name}</p>
                          <p className="truncate text-[0.62rem] text-[#6f7891]">{contact.preview}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-[0.58rem] font-semibold text-[#2f3547]">{contact.time}</span>
                          {contact.unread ? (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3635ba] px-1 text-[0.52rem] font-bold text-white">{contact.unread}</span>
                          ) : (
                            <span className="h-4 min-w-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {filteredContacts.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <p className="text-sm font-semibold text-[#596176]">No conversations found</p>
                      <p className="mt-1 text-xs text-[#8b93a7]">Try another tutor name or message.</p>
                    </div>
                  ) : null}
                </div>
              </aside>

              <section className={`${activeContactId ? "flex" : "hidden xl:flex"} min-h-0 flex-col overflow-hidden rounded-xl border border-ui-border bg-white shadow-[var(--ui-shadow-card)]`}>
                <header className="flex h-[4.4rem] items-center justify-between border-b border-[#edf0f6] px-4">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                      aria-label="Back to chats"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#4f576d] hover:bg-[#f1f3f8] xl:hidden"
                      onClick={() => setActiveContactId(null)}
                      type="button"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <ContactAvatar contact={activeContact} size="h-8 w-8" />
                    <p className="truncate text-[1rem] font-semibold text-[#222838]">{activeContact.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8fbf1] px-3 py-1 text-xs font-semibold text-brand-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-success" />
                    Online
                  </span>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-6" aria-live="polite">
                  {activeMessages.map((message) => {
                    const isOwnMessage = message.author === role;
                    const messageAvatar = isOwnMessage
                      ? { ...activeContact, name: role === "tutor" ? "Oluyinka Alabi" : "You", avatar: "photo" as const }
                      : activeContact;

                    return (
                      <div key={message.id} className={`mt-5 flex items-end gap-2 first:mt-0 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                        <ContactAvatar contact={messageAvatar} size="h-7 w-7" />
                        <p className={`max-w-[min(28rem,78%)] break-words rounded-lg px-4 py-2 text-[0.78rem] font-medium ${isOwnMessage ? "bg-[#4b49d8] text-white" : "bg-[#d9d9f6] text-[#4d5395]"}`}>{message.text}</p>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>

                <form className="border-t border-[#edf0f6] bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-4" onSubmit={sendMessage}>
                  {attachmentName ? (
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-[#f3f4fb] px-3 py-2 text-xs text-[#596176]">
                      <span className="truncate">{attachmentName}</span>
                      <button className="shrink-0 font-semibold text-[#4b49d8]" onClick={() => setAttachmentName("")} type="button">Remove</button>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      className="hidden"
                      onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")}
                      ref={attachmentInputRef}
                      type="file"
                    />
                    <button aria-label="Add attachment" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#2f3547] hover:bg-[#f1f3f8]" onClick={() => attachmentInputRef.current?.click()} type="button">
                      <Plus className="h-4 w-4" />
                    </button>
                    <input
                      aria-label="Message"
                      className="min-h-11 min-w-0 flex-1 rounded-full border border-ui-border bg-brand-primary-soft px-4 text-sm text-[#4d5395] outline-none placeholder:text-[#7e84ad] focus:border-brand-accent"
                      onChange={(event) => setComposer(event.target.value)}
                      placeholder={`Message ${activeContact.name}`}
                      type="text"
                      value={composer}
                    />
                    <button aria-label="Send message" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-success text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!composer.trim() && !attachmentName} type="submit">
                      <SendHorizontal className="h-4 w-4" fill="currentColor" strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
