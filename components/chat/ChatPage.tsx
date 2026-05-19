"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
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
const avatarPhotos = ["/images/ava 1.jpg", "/images/ava 2.jpg", "/images/man.png", "/images/profile.png", "/images/woman.png"];

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
  const shellClass = `inline-flex items-center justify-center overflow-hidden rounded-full bg-transparent ${className}`.trim();
  const variant = avatarVariantFromName(name, avatar);
  const avatarSize = size ? `${size}rem` : "1.65rem";
  const shellStyle = { width: avatarSize, height: avatarSize };

  if (variant === "photo") {
    return (
      <span className={shellClass} style={shellStyle}>
        <span
          className="inline-flex h-full w-full rounded-[inherit] bg-cover bg-center saturate-105"
          style={{ backgroundImage: `url(${avatarPhotoFromName(name)})` }}
        />
      </span>
    );
  }

  return (
    <span className={shellClass} style={shellStyle}>
      <span className="inline-flex h-full w-full items-center justify-center rounded-[inherit] text-[0.7rem] font-bold text-white" style={{ backgroundColor: colorFromName(name) }}>
        {initialsFromName(name)}
      </span>
    </span>
  );
}

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const activeChat = chatItems.find((item) => item.id === activeChatId) ?? chatItems[0];

  return (
    <main className="h-dvh min-h-dvh overflow-hidden bg-[#ececf5] bg-[radial-gradient(circle_at_52%_49%,transparent_0_6px,#f5f5fb_6px_10px,transparent_10px),repeating-conic-gradient(from_0deg_at_52%_49%,#f7f7fc_0deg_6deg,transparent_6deg_16deg)] bg-cover text-[#2b3245]">
      <DashboardNavbar active="Chat" />

      <section className="grid h-[calc(100dvh-var(--topbar-h))] w-full grid-cols-[minmax(280px,340px)_minmax(0,1fr)] gap-[clamp(0.85rem,1vw,1.4rem)] overflow-hidden box-border p-[clamp(0.9rem,1.2vw,1.4rem)] max-[1100px]:grid-cols-1 max-[1100px]:grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <aside className="flex h-full w-full flex-col overflow-hidden rounded-[14px] border border-[#d7dced] bg-white shadow-[0_10px_28px_rgba(42,50,88,0.06)]">
          <div className="border-b border-[#edf0f6] px-4 pb-[0.82rem] pt-[0.86rem] text-[1.25rem] font-medium text-[#8992a8]">Chat</div>

          <div className="border-b border-[#edf0f6] px-4 pb-[0.8rem] pt-[0.75rem]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b5bbca]" />
              <input
                className="h-9 w-full rounded-full border border-[#e4e9f2] bg-[#fbfcff] pl-9 pr-3 text-[0.74rem] text-[#616b80] outline-none placeholder:text-[#b0b7c8]"
                placeholder="Search for tutors"
                type="search"
              />
            </label>
          </div>

          <div className="scrollbar-hover flex-1 overflow-auto bg-white">
            {chatItems.map((item) => (
              <button
                key={item.id}
                className={`relative flex w-full cursor-pointer items-center gap-[0.7rem] border-0 border-b border-[#e3e8f1] px-[0.82rem] py-[0.78rem] text-left transition-colors duration-180 ${
                  activeChatId === item.id ? "bg-[#f1f2ff]" : "bg-white hover:bg-[#f7f9ff]"
                }`}
                onClick={() => setActiveChatId(item.id)}
                type="button"
              >
                {activeChatId === item.id ? <span className="absolute bottom-[0.3rem] left-0 top-[0.3rem] w-[3px] rounded-full bg-[#5b59e8]" /> : null}
                <div className="h-[1.65rem] w-[1.65rem] shrink-0 overflow-hidden rounded-full">
                  <Avatar avatar={item.avatar} name={item.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.76rem] font-semibold text-[#2f3443]">{item.name}</p>
                  <p className="truncate text-[0.67rem] text-[#7f879c]">{item.preview}</p>
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  <span className="text-[0.62rem] font-semibold text-[#666f86]">{item.time}</span>
                  {item.unread ? <span className="inline-flex h-[0.86rem] w-[0.86rem] items-center justify-center rounded-[0.5rem] bg-[#4d49c9] text-[0.52rem] font-bold text-white">{item.unread}</span> : <span className="h-[0.95rem] w-[0.95rem]" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#d7dced] bg-white shadow-[0_10px_28px_rgba(42,50,88,0.06)]">
          <header className="flex items-center justify-between border-b border-[#edf0f6] px-[1.05rem] pb-[0.72rem] pt-[0.74rem]">
            <div className="inline-flex min-w-0 flex-1 items-center gap-2.5">
              <Avatar avatar={activeChat.avatar} name={activeChat.name} size={1.75} />
              <p className="whitespace-nowrap text-[1rem] leading-none font-semibold text-[#2f3443]">{activeChat.name}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8ef] px-2.5 py-1 text-[0.72rem] font-semibold text-[#1e9a60]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22b36f]" />
              {activeChat.online ? "Online" : "Offline"}
            </span>
          </header>

          <div className="flex flex-1 flex-col gap-[0.9rem] px-[1.05rem] pb-[0.8rem] pt-[1.05rem]">
            <div className="flex items-end gap-[0.55rem]">
              <Avatar avatar={activeChat.avatar} name={activeChat.name} size={1.5} />
              <p className="max-w-[38ch] rounded-[12px] bg-[#d6d7f4] px-[0.85rem] py-[0.45rem] text-[0.78rem] font-semibold leading-[1.25] text-[#5960a8] shadow-[0_6px_16px_rgba(95,99,162,0.14)]">Great Kene. please what day works for you</p>
            </div>
            <div className="flex flex-row-reverse items-end justify-start gap-[0.55rem]">
              <Avatar avatar="photo" name="You" size={1.5} />
              <p className="max-w-[38ch] rounded-[12px] bg-[#d6d7f4] px-[0.85rem] py-[0.45rem] text-[0.78rem] font-semibold leading-[1.25] text-[#5960a8] shadow-[0_6px_16px_rgba(95,99,162,0.14)]">Hi Oluyinka, I would love to book a session.</p>
            </div>
            <div className="flex flex-row-reverse items-end justify-start gap-[0.55rem]">
              <Avatar avatar="photo" name="You" size={1.5} />
              <p className="max-w-[38ch] rounded-[12px] bg-[#d6d7f4] px-[0.85rem] py-[0.45rem] text-[0.78rem] font-semibold leading-[1.25] text-[#5960a8] shadow-[0_6px_16px_rgba(95,99,162,0.14)]">Wednesday&apos;s 10 am</p>
            </div>
          </div>

          <footer className="flex items-center gap-[0.7rem] border-t border-[#edf0f6] bg-[#f8f9fd] px-[0.85rem] py-[0.6rem]">
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
