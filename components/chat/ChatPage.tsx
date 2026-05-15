"use client";

import { Plus, Search } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { DashboardNavbar } from "../dashboard/DashboardNavbar";

type ChatItem = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  avatar?: "photo" | "initials";
  online?: boolean;
};


const chatItems: ChatItem[] = [
  { id: 1, name: "Ekene Ezegbunam", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, online: true },
  { id: 2, name: "Akin-ikatiyor Akinbowale", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1 },
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

const avatarPalette = ["#0f6a63", "#1e5f8a", "#6a4a2e", "#6d28d9", "#1f3a8a", "#0f766e", "#14532d"];
const avatarPhotos = ["/images/ava%201.jpg", "/images/ava%202.jpg"];

function nameHash(name: string) {
  return [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function colorFromName(name: string) {
  const hash = nameHash(name);
  return avatarPalette[hash % avatarPalette.length];
}

function avatarVariantFromName(name: string, override?: "photo" | "initials") {
  if (override) return override;
  const hash = nameHash(name);
  return hash % 4 === 0 ? "initials" : "photo";
}

function avatarPhotoFromName(name: string) {
  const hash = nameHash(name);
  return avatarPhotos[hash % avatarPhotos.length];
}

function Avatar({
  name,
  avatar,
  className = "",
  size,
}: {
  name: string;
  avatar?: "photo" | "initials";
  className?: string;
  size?: number;
}) {
  const shellClass = `chat-avatar-shell ${className}`.trim();
  const variant = avatarVariantFromName(name, avatar);
  const shellStyle = size ? ({ "--chat-avatar-size": `${size}rem` } as CSSProperties) : undefined;

  if (variant === "photo") {
    return (
      <span className={shellClass} style={shellStyle}>
        <span
          className="chat-avatar-photo"
          style={{ backgroundImage: `url(${avatarPhotoFromName(name)})` }}
        />
      </span>
    );
  }

  return (
    <span className={shellClass} style={shellStyle}>
      <span className="chat-avatar" style={{ backgroundColor: colorFromName(name) }}>
        {initialsFromName(name)}
      </span>
    </span>
  );
}

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const activeChat = chatItems.find((item) => item.id === activeChatId) ?? chatItems[0];

  return (
    <main className="chat-screen text-[#2b3245]">
      <DashboardNavbar active="Chat" />

      <section className="chat-layout">
        <aside className="chat-list-panel">
          <div className="chat-list-title">Chat</div>

          <div className="chat-search-wrap">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b5bbca]" />
              <input
                className="h-9 w-full rounded-full border border-[#e4e9f2] bg-[#fbfcff] pl-9 pr-3 text-[0.74rem] text-[#616b80] outline-none placeholder:text-[#b0b7c8]"
                placeholder="Search for tutors"
                type="search"
              />
            </label>
          </div>

          <div className="chat-rows scrollbar-hover">
            {chatItems.map((item) => (
              <button
                key={item.id}
                className={`chat-row ${activeChatId === item.id ? "chat-row-active" : ""}`}
                onClick={() => setActiveChatId(item.id)}
                type="button"
              >
                <div className="chat-avatar-wrap">
                  <Avatar avatar={item.avatar} name={item.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.76rem] font-semibold text-[#2f3443]">{item.name}</p>
                  <p className="truncate text-[0.67rem] text-[#7f879c]">{item.preview}</p>
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  <span className="text-[0.62rem] font-semibold text-[#666f86]">{item.time}</span>
                  {item.unread ? <span className="chat-unread">{item.unread}</span> : <span className="h-[0.95rem] w-[0.95rem]" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-convo-panel">
          <header className="chat-convo-header">
            <div className="inline-flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar avatar={activeChat.avatar} name={activeChat.name} size={1.75} />
              <p className="whitespace-nowrap text-[1rem] leading-none font-semibold text-[#2f3443]">{activeChat.name}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8ef] px-2.5 py-1 text-[0.72rem] font-semibold text-[#1e9a60]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22b36f]" />
              {activeChat.online ? "Online" : "Offline"}
            </span>
          </header>

          <div className="chat-convo-body">
            <div className="chat-bubble-left-wrap">
              <Avatar avatar={activeChat.avatar} name={activeChat.name} size={1.5} />
              <p className="chat-bubble chat-bubble-left">Great Kene. please what day works for you</p>
            </div>
            <div className="chat-bubble-right-wrap">
              <Avatar avatar="photo" name="You" size={1.5} />
              <p className="chat-bubble chat-bubble-right">Hi Oluyinka, I would love to book a session.</p>
            </div>
            <div className="chat-bubble-right-wrap">
              <Avatar avatar="photo" name="You" size={1.5} />
              <p className="chat-bubble chat-bubble-right">Wednesday&apos;s 10 am</p>
            </div>
          </div>

          <footer className="chat-convo-footer">
            <button className="text-[2rem] leading-none text-[#4b4f5f]" type="button">
              <Plus className="h-5 w-5" />
            </button>
            <input
              className="h-9 flex-1 rounded-full border border-[#dfe4ef] bg-[#e9eaf7] px-4 text-[0.86rem] text-[#4c5492] outline-none placeholder:text-[#636ba7]"
              placeholder="Type a message..."
              type="text"
            />
            <button className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#18a96f] text-white" type="button">
              <span className="text-[0.6rem]">➤</span>
            </button>
          </footer>
        </section>
      </section>
    </main>
  );
}
