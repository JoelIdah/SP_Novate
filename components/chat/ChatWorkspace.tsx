"use client";

import { Plus, Search, SendHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";

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

export default function ChatWorkspace({ role, navbar }: ChatWorkspaceProps) {
  const contacts = role === "tutor" ? tutorContacts : studentContacts;
  const [activeContactId, setActiveContactId] = useState(contacts[0]?.id ?? null);
  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? contacts[0];
  const searchPlaceholder = role === "tutor" ? "Search for students" : "Search for tutors";
  const composerValue = role === "tutor" ? "Great Kene. please what day works for you" : "Hi Oluyinka, I would love to book a sessio";

  return (
    <main className="dashboard-screen overflow-hidden bg-[#f1f1fb] text-[#2b3245]">
      <div className="dashboard-shell bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-pattern.png')" }}>
        {navbar}

        <section className="dashboard-main p-0">
          <div className="dashboard-content-frame px-4 py-4 md:px-5">
            <section className="grid h-full min-h-0 w-full gap-5 xl:grid-cols-[23rem_minmax(0,1fr)]">
              <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#dfe3ee] bg-white shadow-[0_10px_24px_rgba(31,40,74,0.05)]">
                <div className="border-b border-[#edf0f6] px-4 py-4">
                  <h1 className="text-[1rem] font-medium text-[#858ea2]">Chat</h1>
                </div>

                <div className="border-b border-[#edf0f6] px-4 py-3">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#aeb6c7]" />
                    <input
                      className="h-9 w-full rounded-full border border-[#e2e7f2] bg-white pl-9 pr-3 text-[0.74rem] text-[#5f667b] outline-none placeholder:text-[#b1b8c8]"
                      placeholder={searchPlaceholder}
                      type="search"
                    />
                  </label>
                </div>

                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto">
                  {contacts.map((contact) => {
                    const active = activeContactId === contact.id;
                    return (
                      <button
                        key={`${contact.name}-${contact.id}`}
                        className={`relative flex w-full items-center gap-2 border-b border-[#e6eaf2] px-3 py-2.5 text-left ${
                          active ? "bg-[#f4f5ff]" : "bg-white hover:bg-[#fafbff]"
                        }`}
                        onClick={() => setActiveContactId(contact.id)}
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
                </div>
              </aside>

              <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#dfe3ee] bg-white shadow-[0_10px_24px_rgba(31,40,74,0.05)]">
                <header className="flex h-[4.4rem] items-center justify-between border-b border-[#edf0f6] px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <ContactAvatar contact={activeContact} size="h-8 w-8" />
                    <p className="truncate text-[1rem] font-semibold text-[#222838]">{activeContact.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8fbf1] px-3 py-1 text-[0.72rem] font-semibold text-[#10935a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#15b86b]" />
                    Online
                  </span>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                  {messages.map((message) => {
                    const isOwnMessage = message.author === role;
                    const messageAvatar = isOwnMessage
                      ? { ...activeContact, name: role === "tutor" ? "Oluyinka Alabi" : "You", avatar: "photo" as const }
                      : activeContact;

                    return (
                      <div key={message.id} className={`mt-5 flex items-end gap-2 first:mt-0 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                        <ContactAvatar contact={messageAvatar} size="h-7 w-7" />
                        <p className="max-w-[28rem] rounded-lg bg-[#d9d9f6] px-4 py-2 text-[0.78rem] font-medium text-[#4d5395]">{message.text}</p>
                      </div>
                    );
                  })}
                </div>

                <footer className="flex items-center gap-3 border-t border-[#edf0f6] bg-white px-4 py-3">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2f3547] hover:bg-[#f1f3f8]" type="button">
                    <Plus className="h-4 w-4" />
                  </button>
                  <input
                    className="h-9 min-w-0 flex-1 rounded-full border border-[#d4d9ef] bg-[#ececf8] px-4 text-[0.76rem] text-[#4d5395] outline-none placeholder:text-[#4d5395]"
                    defaultValue={composerValue}
                    type="text"
                  />
                  <button className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16b76d] text-white" type="button">
                    <SendHorizontal className="h-3 w-3" fill="currentColor" strokeWidth={2.5} />
                  </button>
                </footer>
              </section>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
