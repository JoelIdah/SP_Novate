import Image from "next/image";

function NavGlyph({ type }: { type: "home" | "bookings" | "transactions" | "chat" }) {
  if (type === "home") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <path d="M2.8 7.2 8 2.8l5.2 4.4v5.3a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1V7.2Z" fill="currentColor" opacity=".35" />
        <path d="M6.2 13.5V9.9h3.6v3.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === "bookings") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <rect fill="currentColor" height="10" opacity=".25" rx="2" width="11" x="2.5" y="3.1" />
        <path d="M5 2.8v2.1M11 2.8v2.1M2.5 6.2h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === "transactions") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <path d="M3 5.3h10M3 8h7.5M3 10.7h8.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" />
        <circle cx="11.7" cy="8" fill="currentColor" opacity=".35" r="2.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
      <path d="M2.8 4.7a1.8 1.8 0 0 1 1.8-1.8h6.8a1.8 1.8 0 0 1 1.8 1.8v4.1a1.8 1.8 0 0 1-1.8 1.8H8L5.2 13V10.6H4.6a1.8 1.8 0 0 1-1.8-1.8V4.7Z" fill="currentColor" opacity=".28" />
      <circle cx="6.2" cy="6.8" fill="currentColor" r=".65" />
      <circle cx="8" cy="6.8" fill="currentColor" r=".65" />
      <circle cx="9.8" cy="6.8" fill="currentColor" r=".65" />
    </svg>
  );
}

export function DashboardNavbar() {
  return (
    <header className="border-b border-[#e6e9f2] bg-white/95 backdrop-blur">
      <div className="app-page-wrap flex min-h-15 items-center gap-4 py-2">
        <Image alt="SP Novate" className="h-9 w-auto shrink-0 md:h-10" height={40} src="/logo/logo.png" width={40} />

        <nav className="order-3 -mx-[var(--app-gutter)] w-screen overflow-x-auto border-t border-[#eceef5] px-[var(--app-gutter)] pt-2 md:order-2 md:mx-0 md:w-auto md:flex-1 md:overflow-visible md:border-t-0 md:px-0 md:pt-0">
          <div className="mx-auto flex min-w-max items-end justify-start gap-8 text-[0.82rem] font-semibold text-[#7b8192] md:justify-center md:gap-10">
            <button className="relative flex min-w-[4.25rem] flex-col items-center gap-1.5 pb-2 text-[#4d4bc5]" type="button">
              <span className="inline-flex h-4 w-4 items-center justify-center text-[#6f6dd5]"><NavGlyph type="home" /></span>
              <span>Home</span>
              <span className="absolute bottom-0 left-1/2 h-[2px] w-[5.4rem] -translate-x-1/2 rounded-full bg-[#5b57df]" />
            </button>
            <button className="flex min-w-[4.25rem] flex-col items-center gap-1.5 pb-2" type="button">
              <span className="inline-flex h-4 w-4 items-center justify-center text-[#8b90a3]"><NavGlyph type="bookings" /></span>
              <span>Bookings</span>
            </button>
            <button className="flex min-w-[4.25rem] flex-col items-center gap-1.5 pb-2" type="button">
              <span className="inline-flex h-4 w-4 items-center justify-center text-[#8b90a3]"><NavGlyph type="transactions" /></span>
              <span>Transactions</span>
            </button>
            <button className="flex min-w-[4.25rem] flex-col items-center gap-1.5 pb-2" type="button">
              <span className="inline-flex h-4 w-4 items-center justify-center text-[#8b90a3]"><NavGlyph type="chat" /></span>
              <span>Chat</span>
            </button>
          </div>
        </nav>

        <div className="order-2 ml-auto flex items-center gap-2 md:order-3">
          <button
            className="hidden rounded-full border border-[#eceff6] bg-[#f5f6fa] px-4 py-1.5 text-[0.75rem] font-semibold text-[#4a4f5f] sm:inline-flex"
            type="button"
          >
            Become a tutor
          </button>
          <button className="flex items-center gap-1 rounded-full border border-[#e8eaf3] bg-white px-1.5 py-1.5" type="button">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#201b6b] text-[0.7rem] font-semibold text-white">O</span>
            <span className="pr-0.5 text-[0.65rem] text-[#8a90a0]">▼</span>
          </button>
        </div>
      </div>
    </header>
  );
}
