import { Search } from "lucide-react";
import { DashboardNavbar } from "../dashboard/DashboardNavbar";

type ChatItem = {
  id: number;
  name: string;
  preview: string;
  time: string;
  unread?: number;
  avatar: string;
};


const chatItems: ChatItem[] = [
  { id: 1, name: "Ekene Ezegbunam", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "photo" },
  { id: 2, name: "Akin-ikatiyor Akinbowale", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "A" },
  { id: 3, name: "Quadri Ahmed", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "Q" },
  { id: 4, name: "Regina Akpan", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", avatar: "R" },
  { id: 5, name: "David Lawal", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", avatar: "D" },
  { id: 6, name: "Elizabeth Obi", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 2, avatar: "E" },
  { id: 7, name: "Doris Irabor", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", avatar: "D" },
  { id: 8, name: "Catherine Isime", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", avatar: "C" },
  { id: 9, name: "Abolarinde Cole", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", avatar: "A" },
  { id: 10, name: "Edward Samuel", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "E" },
  { id: 11, name: "Edward Samuel", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25", unread: 1, avatar: "E" },
];

export default function ChatPage() {
  return (
    <main className="chat-screen text-[#2b3245]">
      <DashboardNavbar active="Chat" />

      <section className="chat-layout">
        <aside className="chat-list-panel">
          <div className="border-b border-[#edf0f6] px-4 py-3 text-[1rem] font-medium text-[#8f98ad]">Chat</div>

          <div className="border-b border-[#edf0f6] p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b5bbca]" />
              <input
                className="h-8 w-full rounded-full border border-[#e8ecf4] bg-[#f8f9fc] pl-9 pr-3 text-[0.72rem] text-[#616b80] outline-none placeholder:text-[#b0b7c8]"
                placeholder="Search for tutors"
                type="search"
              />
            </label>
          </div>

          <div className="chat-rows scrollbar-hover">
            {chatItems.map((item) => (
              <button key={item.id} className="chat-row" type="button">
                <div className="chat-avatar-wrap">
                  {item.avatar === "photo" ? (
                    <span className="chat-avatar-photo" />
                  ) : (
                    <span className="chat-avatar">{item.avatar}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.72rem] font-semibold text-[#2f3443]">{item.name}</p>
                  <p className="truncate text-[0.64rem] text-[#8f97ab]">{item.preview}</p>
                </div>
                <div className="ml-2 flex flex-col items-end gap-1">
                  <span className="text-[0.58rem] font-semibold text-[#7f8799]">{item.time}</span>
                  {item.unread ? <span className="chat-unread">{item.unread}</span> : <span className="h-[0.95rem] w-[0.95rem]" />}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
