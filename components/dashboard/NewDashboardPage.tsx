// "use client";

// import Link from "next/link";

// // ─── Types ───────────────────────────────────────────────────────────────────

// type BookingStatus = "Completed" | "Ongoing" | "Awaiting approval";

// interface Booking {
//   tutor: string;
//   subject: string;
//   status: BookingStatus;
// }

// interface Message {
//   id: number;
//   name: string;
//   preview: string;
//   time: string;
//   unread: number;
//   initials: string;
//   avatarColor: string;
//   textColor: string;
// }

// // ─── Data ────────────────────────────────────────────────────────────────────

// const bookings: Booking[] = [
//   { tutor: "Mr. Akin-akintaylor", subject: "Entrance Exams", status: "Completed" },
//   { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
//   { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
//   { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Ongoing" },
//   { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Awaiting approval" },
// ];

// const messages: Message[] = [
//   {
//     id: 1,
//     name: "Ekene Ezegbunam",
//     preview: "Hi Oluyinka, I would love to book a session.",
//     time: "11:25",
//     unread: 1,
//     initials: "EE",
//     avatarColor: "#c8a882",
//     textColor: "#6b4c2a",
//   },
//   {
//     id: 2,
//     name: "Akin-akintaylor Akinbowale",
//     preview: "Hi Oluyinka, I would love to book a session.",
//     time: "11:25",
//     unread: 1,
//     initials: "A",
//     avatarColor: "#e8e8f0",
//     textColor: "#3730a3",
//   },
//   {
//     id: 3,
//     name: "Quadri Ahmed",
//     preview: "Hi Oluyinka, I would love to book a session.",
//     time: "11:25",
//     unread: 1,
//     initials: "Q",
//     avatarColor: "#16a34a",
//     textColor: "#ffffff",
//   },
// ];

// const stats = [
//   { label: "Sessions booked", value: 8 },
//   { label: "Sessions completed", value: 2 },
//   { label: "Sessions ongoing", value: 4 },
//   { label: "Sessions pending", value: 2 },
// ];

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function StatusDot({ status }: { status: BookingStatus }) {
//   const colors: Record<BookingStatus, string> = {
//     Completed: "#22c55e",
//     Ongoing: "#a78bfa",
//     "Awaiting approval": "#3b82f6",
//   };
//   return (
//     <span className="flex items-center gap-1.5 text-sm text-gray-700">
//       <span
//         className="inline-block w-2 h-2 rounded-full flex-shrink-0"
//         style={{ backgroundColor: colors[status] }}
//       />
//       {status}
//     </span>
//   );
// }

// function Avatar({
//   initials,
//   bg,
//   color,
//   size = 34,
// }: {
//   initials: string;
//   bg: string;
//   color: string;
//   size?: number;
// }) {
//   return (
//     <div
//       className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
//       style={{
//         width: size,
//         height: size,
//         backgroundColor: bg,
//         color,
//         fontSize: size * 0.35,
//       }}
//     >
//       {initials}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function Dashboard() {
//   return (
//     <div className="min-h-screen bg-gray-100 font-sans">
//       {/* ── Navbar ── */}
//       <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-8 h-[60px] flex items-center relative">
//           {/* Logo */}
//           <div className="flex items-center gap-1.5 mr-auto">
//             <div className="w-9 h-9 bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tight">
//               SP<sup className="text-[8px]">2</sup>
//             </div>
//           </div>

//           {/* Center nav links */}
//           <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
//             {[
//               { label: "Home", href: "/", active: true, icon: "🏠" },
//               { label: "Bookings", href: "/bookings", active: false, icon: "📅" },
//               { label: "Transactions", href: "/transactions", active: false, icon: "💳" },
//               { label: "Chat", href: "/chat", active: false, icon: "💬" },
//             ].map((item) => (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 className={`flex flex-col items-center gap-0.5 px-5 py-2 text-[clamp(0.78rem,0.76vw,1.1rem)] transition-colors no-underline border-b-2 ${
//                   item.active
//                     ? "text-indigo-700 border-indigo-700"
//                     : "text-gray-400 border-transparent hover:text-gray-600"
//                 }`}
//               >
//                 <span className="text-base leading-none">{item.icon}</span>
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           {/* Right side */}
//           <div className="flex items-center gap-2.5 ml-auto">
//             <button className="border border-gray-300 bg-white rounded-full px-4 py-1.5 text-[clamp(0.78rem,0.76vw,1.1rem)] text-gray-700 hover:bg-gray-50 transition-colors">
//               Become a tutor
//             </button>
//             <div className="flex items-center gap-1 cursor-pointer">
//               <div className="w-8 h-8 rounded-full bg-indigo-700 text-white flex items-center justify-center text-[clamp(0.78rem,0.76vw,1.1rem)] font-semibold">
//                 O
//               </div>
//               <svg
//                 className="w-3.5 h-3.5 text-gray-500"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//               </svg>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* ── Main content ── */}
//       <div className="max-w-6xl mx-auto px-8 py-6">

//         {/* Actions */}
//         <p className="text-[clamp(0.78rem,0.76vw,1.1rem)] text-gray-400 mb-3">Actions</p>
//         <div className="grid grid-cols-3 gap-3 mb-7">
//           <ActionCard
//             bg="bg-blue-50"
//             border="border-blue-200"
//             iconBg="bg-blue-100"
//             iconColor="text-blue-500"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//             }
//             title="Book a session"
//             subtitle="Find a tutor and schedule your session."
//           />
//           <ActionCard
//             bg="bg-green-50"
//             border="border-green-200"
//             iconBg="bg-green-100"
//             iconColor="text-green-600"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//               </svg>
//             }
//             title="Start a conversation"
//             subtitle="Go to your chat with the tutors."
//           />
//           <ActionCard
//             bg="bg-amber-50"
//             border="border-amber-200"
//             iconBg="bg-amber-100"
//             iconColor="text-amber-500"
//             icon={
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//               </svg>
//             }
//             title="Check transactions"
//             subtitle="Add money to your main balance."
//           />
//         </div>

//         {/* Learning Overview */}
//         <p className="text-[clamp(0.78rem,0.76vw,1.1rem)] text-gray-400 mb-3">Learning Overview</p>
//         <div className="grid grid-cols-4 gap-3 mb-7">
//           {stats.map((s) => (
//             <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
//               <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-400 mb-2">{s.label}</p>
//               <p className="text-[26px] font-semibold text-gray-900">{s.value}</p>
//             </div>
//           ))}
//         </div>

//         {/* Bookings + Messages */}
//         <div className="grid grid-cols-2 gap-4 mb-7">
//           {/* Managed Bookings */}
//           <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
//               <span className="text-[clamp(0.78rem,0.76vw,1.1rem)] font-medium text-gray-800">Managed Bookings</span>
//               <Link href="/bookings" className="text-[clamp(0.74rem,0.72vw,1rem)] text-indigo-700 flex items-center gap-0.5 no-underline hover:underline">
//                 Go to managed bookings
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                 </svg>
//               </Link>
//             </div>
//             <table className="w-full text-[clamp(0.78rem,0.76vw,1.1rem)]">
//               <thead>
//                 <tr>
//                   {["Tutor", "Subject", "Status", ""].map((h) => (
//                     <th
//                       key={h}
//                       className="text-left text-[clamp(0.74rem,0.72vw,1rem)] text-gray-400 font-medium px-4 py-2.5 border-b border-gray-100"
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {bookings.map((b, i) => (
//                   <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
//                     <td className="px-4 py-2.5 text-gray-700">{b.tutor}</td>
//                     <td className="px-4 py-2.5 text-gray-700">{b.subject}</td>
//                     <td className="px-4 py-2.5">
//                       <StatusDot status={b.status} />
//                     </td>
//                     <td className="px-4 py-2.5 text-right">
//                       <button className="text-gray-300 hover:text-gray-500 text-lg leading-none px-1">⋮</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Messages */}
//           <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//             <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
//               <span className="text-[clamp(0.78rem,0.76vw,1.1rem)] font-medium text-gray-800">Messages</span>
//               <Link href="/chat" className="text-[clamp(0.74rem,0.72vw,1rem)] text-indigo-700 flex items-center gap-0.5 no-underline hover:underline">
//                 Go to chat
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                 </svg>
//               </Link>
//             </div>
//             <p className="px-4 pt-3 pb-1 text-[clamp(0.74rem,0.72vw,1rem)] text-gray-300">Chat</p>
//             {messages.map((m) => (
//               <div
//                 key={m.id}
//                 className="flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
//               >
//                 <Avatar initials={m.initials} bg={m.avatarColor} color={m.textColor} />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-[clamp(0.78rem,0.76vw,1.1rem)] font-medium text-gray-800 truncate">{m.name}</p>
//                   <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-400 truncate">{m.preview}</p>
//                 </div>
//                 <div className="flex flex-col items-end gap-1 flex-shrink-0">
//                   <span className="text-[clamp(0.72rem,0.68vw,0.96rem)] text-gray-400">{m.time}</span>
//                   {m.unread > 0 && (
//                     <span className="w-[18px] h-[18px] rounded-full bg-indigo-700 text-white text-[clamp(0.68rem,0.64vw,0.92rem)] flex items-center justify-center">
//                       {m.unread}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Resource & Support */}
//         <p className="text-[clamp(0.78rem,0.76vw,1.1rem)] text-gray-400 mb-3">Resource & Support</p>
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 relative overflow-hidden">
//             <p className="text-[clamp(0.82rem,0.82vw,1.2rem)] font-semibold text-gray-800 mb-1">Watch our demo video</p>
//             <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-500 mb-4 max-w-[160px]">
//               Watch this intro video to learn how SP novate works.
//             </p>
//             <WatchButton />
//             {/* Decorative monitor illustration */}
//             <div className="absolute right-3 bottom-3 opacity-80">
//               <div className="w-20 h-14 bg-white rounded-lg shadow flex items-center justify-center relative">
//                 <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
//                   <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                 </div>
//                 <div className="absolute -bottom-1.5 left-2.5 w-3 h-3 bg-yellow-400 rounded-full" />
//                 <div className="absolute -top-1.5 right-2 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
//             <p className="text-[clamp(0.82rem,0.82vw,1.2rem)] font-semibold text-gray-800 mb-1">Learn about our tutors</p>
//             <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-500 mb-4">Watch this intro video to learn more about our tutors</p>
//             <WatchButton />
//           </div>

//           <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
//             <p className="text-[clamp(0.82rem,0.82vw,1.2rem)] font-semibold text-gray-800 mb-1">What is a finder's fee</p>
//             <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-500 mb-4">Watch this intro video to learn about our finder's fee</p>
//             <WatchButton />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Shared small components ──────────────────────────────────────────────────

// function ActionCard({
//   bg,
//   border,
//   iconBg,
//   iconColor,
//   icon,
//   title,
//   subtitle,
// }: {
//   bg: string;
//   border: string;
//   iconBg: string;
//   iconColor: string;
//   icon: React.ReactNode;
//   title: string;
//   subtitle: string;
// }) {
//   return (
//     <div
//       className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:shadow-sm transition-shadow`}
//     >
//       <div className={`${iconBg} ${iconColor} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-[clamp(0.82rem,0.82vw,1.2rem)] font-semibold text-gray-800 mb-0.5">{title}</p>
//         <p className="text-[clamp(0.74rem,0.72vw,1rem)] text-gray-500">{subtitle}</p>
//       </div>
//     </div>
//   );
// }

// function WatchButton() {
//   return (
//     <button className="inline-flex items-center gap-1.5 border border-gray-300 rounded-full px-3.5 py-1.5 text-[clamp(0.74rem,0.72vw,1rem)] text-gray-700 bg-white hover:bg-gray-50 transition-colors">
//       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//         <circle cx="12" cy="12" r="10" />
//         <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l6 4-6 4V8z" />
//       </svg>
//       Watch video
//     </button>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { DashboardNavbar } from "./DashboardNavbar";
import { useState } from "react";
import {
  Home,
  CalendarDays,
  CreditCard,
  MessageCircle,
  Menu,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  PlayCircle,
} from "lucide-react";

const stats = [
  {
    label: "Sessions booked",
    value: 8,
  },
  {
    label: "Sessions completed",
    value: 2,
  },
  {
    label: "Sessions ongoing",
    value: 4,
  },
  {
    label: "Sessions pending",
    value: 2,
  },
];

const bookings = [
  {
    tutor: "Mr. Akin-akintaylor",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Ongoing",
    color: "#A855F7",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Awaiting approval",
    color: "#3B82F6",
  },
];

const messages = [
  {
    name: "Ekene Ezegbunam",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "EE",
    avatarBg: "#D6B18A",
    avatarText: "#5E3B1E",
  },
  {
    name: "Akin-akintaylor Akinbowale",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "A",
    avatarBg: "#166534",
    avatarText: "#FFFFFF",
  },
  {
    name: "Quadri Ahmed",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "Q",
    avatarBg: "#14532D",
    avatarText: "#FFFFFF",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-screen bg-white text-[#1E1E1E]">
      <div className="xl:hidden">
        <MobileDashboardView />
      </div>
      <div className="hidden xl:block">
      <div className="dashboard-shell">
      <DashboardNavbar active="Home" />

      <main className="dashboard-main">
        <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
          <div className="dashboard-stack" data-dashboard-content>
            <section>
              <SectionTitle title="Actions" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] md:grid-cols-3">
                <ActionCard
                  title="Book a session"
                  subtitle="Find a tutor and schedule your session."
                  iconBg="bg-[#DCEEFF]"
                  iconColor="text-[#3B82F6]"
                  border="border-[#BFDBFE]"
                  bg="bg-[#F7FBFF]"
                  icon={<CalendarDays className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />

                <ActionCard
                  title="Start a conversation"
                  subtitle="Go to your chat with the tutors"
                  iconBg="bg-[#DDF8F3]"
                  iconColor="text-[#14B8A6]"
                  border="border-[#B8F1E8]"
                  bg="bg-[#F4FFFD]"
                  icon={<MessageCircle className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />

                <ActionCard
                  title="Check transactions"
                  subtitle="Add money to your main balance."
                  iconBg="bg-[#FEF3C7]"
                  iconColor="text-[#D97706]"
                  border="border-[#FDE68A]"
                  bg="bg-[#FFFCF5]"
                  icon={<CreditCard className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />
              </div>
            </section>

            <section>
              <SectionTitle title="Learning Overview" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[clamp(0.58rem,0.66vw,0.95rem)] border border-[#E5E7EB] bg-white px-[clamp(0.9rem,1vw,1.5rem)] py-[clamp(0.85rem,1vw,1.35rem)]"
                  >
                    <p className="text-[clamp(0.85rem,0.7vw,0.98rem)] leading-[150%] text-[#9CA3AF]">{stat.label}</p>

                    <h3 className="mt-1 text-[clamp(1.2rem,1.1vw,1.6rem)] font-semibold leading-[120%] tracking-[-0.2px] text-[#111827]">
                      {stat.value}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-section-fill">
              <div className="dashboard-section-fill-grid grid grid-cols-1 gap-[var(--panel-gap)] lg:grid-cols-2">
                <div className="dashboard-section-fill-card overflow-x-auto rounded-2xl border border-[#E6E9F2] bg-white shadow-[0_8px_24px_rgba(27,35,74,0.04)]">
                  <CardHeader
                    title="Managed Bookings"
                    action="Go to managed bookings"
                  />

                  <table className="dashboard-section-fill-body min-w-[34rem] w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#F4F6FA] text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#848BA0]">
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Tutor</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Subject</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Status</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)]" />
                      </tr>
                    </thead>

                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr
                          key={index}
                          className={`border-t border-[#EEF1F6] text-[clamp(0.9rem,0.78vw,1.05rem)] leading-[150%] font-normal text-[#4F566A] ${index >= 3 ? "compact-hide" : index === 2 ? "ultra-compact-hide" : ""}`}
                        >
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">{booking.tutor}</td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">{booking.subject}</td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-[clamp(0.34rem,0.34vw,0.5rem)] w-[clamp(0.34rem,0.34vw,0.5rem)] rounded-full"
                                style={{ backgroundColor: booking.color }}
                              />
                              {booking.status}
                            </div>
                          </td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)] text-right">
                            <MoreVertical className="ml-auto h-[clamp(0.8rem,1vw,1.1rem)] w-[clamp(0.8rem,1vw,1.1rem)] text-[#9CA3AF]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dashboard-section-fill-card overflow-hidden rounded-2xl border border-[#E6E9F2] bg-white shadow-[0_8px_24px_rgba(27,35,74,0.04)]">
                  <CardHeader title="Messages" action="Go to chat" />

                  <div className="border-b border-[#EEF1F6] px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.45rem,0.75vw,0.85rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium leading-[150%] text-[#B1B7C6]">
                    Chat
                  </div>

                  <div className="dashboard-section-fill-body">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-[clamp(0.65rem,1vw,1.2rem)] border-b border-[#F0F2F7] px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.45rem,0.75vw,0.85rem)] last:border-b-0 hover:bg-[#FAFAFA] ${index === 2 ? "compact-hide" : index === 1 ? "ultra-compact-hide" : ""}`}
                      >
                        <div
                          className="flex h-[clamp(1.8rem,1.8vw,2.6rem)] w-[clamp(1.8rem,1.8vw,2.6rem)] items-center justify-center rounded-md text-[clamp(0.74rem,0.72vw,1rem)] font-semibold"
                          style={{
                            backgroundColor: message.avatarBg,
                            color: message.avatarText,
                          }}
                        >
                          {message.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[clamp(0.98rem,0.85vw,1.15rem)] leading-[150%] font-semibold text-[#374151]">
                            {message.name}
                          </p>

                          <p className="truncate text-[clamp(0.88rem,0.72vw,0.98rem)] leading-[150%] text-[#9CA3AF]">
                            {message.message}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[clamp(0.88rem,0.72vw,0.98rem)] text-[#9CA3AF]">
                            {message.time}
                          </span>

                          <div className="flex h-[clamp(0.8rem,0.8vw,1.15rem)] w-[clamp(0.8rem,0.8vw,1.15rem)] items-center justify-center rounded-full bg-[#4338CA] text-[clamp(0.8rem,0.65vw,0.9rem)] text-white">
                            1
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle title="Resource & Support" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] lg:grid-cols-[1.5fr_1fr_1fr]">
                <SupportCard
                  title="Watch our demo video"
                  description="Watch this intro video to learn how SP novate works."
                  bg="bg-[#EEF6FF]"
                  border="border-[#CFE4FF]"
                  large
                />

                <SupportCard
                  title="Learn about our tutors"
                  description="Watch this intro video to learn more about our tutors"
                  bg="bg-[#FFFBF2]"
                  border="border-[#F7E7B8]"
                />

                <SupportCard
                  title="What is a finder's fee"
                  description="Watch this intro video to learn about our finder's fee"
                  bg="bg-[#F5F7FB]"
                  border="border-[#E5E7EB]"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
      </div>
      </div>
    </div>
  );
}

function MobileDashboardView() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-dvh bg-[#f7f8fb] px-4 pb-6 pt-4 sm:px-5 md:px-6 md:pb-8">
      <div className="mb-5 flex items-center gap-3 md:mb-6">
        <Image alt="SP Novate" className="h-7 w-auto shrink-0" height={28} src="/logo/logo.png" width={28} />
        <div className="flex h-9 flex-1 items-center rounded-full border border-[#cdd5e5] bg-white px-3">
          <span className="truncate text-sm text-[#7a8195]">Search for any item here</span>
          <Search className="ml-auto h-4 w-4 text-[#6c7387]" />
        </div>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#2e3448]" onClick={() => setIsMenuOpen((prev) => !prev)} type="button">
          {isMenuOpen ? <ChevronDown className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMenuOpen ? (
        <nav className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-[#e2e6ef] bg-white p-2">
          {[
            { label: "Home", href: "/dashboard", active: true },
            { label: "Bookings", href: "/bookings", active: false },
            { label: "Transactions", href: "/transactions", active: false },
            { label: "Chat", href: "/chat", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-lg border px-3 py-2 text-[0.82rem] font-semibold ${
                item.active
                  ? "border-[#d8daf8] bg-[#eef0ff] text-[#4A46D6]"
                  : "border-[#e6eaf3] bg-white text-[#5F6678]"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      <section className="mb-8 md:mb-9">
        <SectionTitle title="Actions" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <ActionCard title="Set up subjects" subtitle="Go to your chat with the tutors" iconBg="bg-[#e9dbff]" iconColor="text-[#7a38df]" border="border-[#eadbfd]" bg="bg-[#f6efff]" icon={<MessageCircle className="h-5 w-5" />} />
          </div>
          <ActionCard title="Create a new resource" subtitle="See request from prospective students" iconBg="bg-[#d7ecff]" iconColor="text-[#2584d6]" border="border-[#bfe2ff]" bg="bg-[#f3f9ff]" icon={<CreditCard className="h-5 w-5" />} />
          <ActionCard title="Update profile" subtitle="Go to your active students" iconBg="bg-[#d6f3f4]" iconColor="text-[#1f9ba5]" border="border-[#b9e8ea]" bg="bg-[#f2fcfd]" icon={<Home className="h-5 w-5" />} />
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <SectionTitle title="Overview" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Total tutor request", value: 8 },
            { label: "Total subjects", value: 4 },
            { label: "Resources created", value: 2 },
            { label: "Completion rate", value: "2%" },
            { label: "Active Students", value: 8 },
            { label: "Taught students", value: 4 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#dfe3ec] bg-white px-5 py-6">
              <p className="text-[0.72rem] text-[#8a91a4]">{item.label}</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none text-[#171d2c]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[1.1rem] font-semibold text-[#565d70]">Bookings Requests</h3>
          <button className="text-[1.05rem] font-semibold text-[#4c46d9]" type="button">Go to managed bookings</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#dfe3ec] bg-white">
          {bookings.map((booking, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-[#edf0f6] px-4 py-4 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1rem] font-semibold text-[#2f3547]">{booking.tutor}</p>
                <p className="text-[0.95rem] text-[#5f667b]">Information Technology</p>
              </div>
              <div className="inline-flex min-w-[7.5rem] items-center gap-2 text-[0.95rem] text-[#4c5368]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: booking.color }} />
                {booking.status}
              </div>
              <MoreVertical className="h-4 w-4 text-[#5f667b]" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[1.1rem] font-semibold text-[#565d70]">Messages</h3>
          <button className="text-[1.05rem] font-semibold text-[#4c46d9]" type="button">Go to chat</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#dfe3ec] bg-white">
          <div className="border-b border-[#edf0f6] px-4 py-3 text-[1rem] text-[#a1a8b9]">Chat</div>
          {messages.map((message, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-[#edf0f6] px-4 py-3 last:border-b-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-white" style={{ backgroundColor: idx === 0 ? "#c4862f" : "#165e57" }}>
                {message.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.96rem] font-semibold text-[#2f3547]">{message.name}</p>
                <p className="truncate text-[0.86rem] text-[#767e93]">{message.message}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.84rem] text-[#58607a]">{message.time}</p>
                <span className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4545c6] text-[0.65rem] text-white">1</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Resource & Support" />
        <div className="space-y-5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <SupportCard title="Watch our demo video" description="Watch this intro video to learn how SP novate works." bg="bg-[#e9f4ff]" border="border-[#cfe5ff]" />
          <SupportCard title="Learn about our tutors" description="Watch this intro video to learn more about our tutors" bg="bg-[#f7f3e9]" border="border-[#ebe0c8]" />
          <div className="md:col-span-2">
            <SupportCard title="What is a finder's fee" description="Watch this intro video to learn about our finder's fee" bg="bg-[#eef2f8]" border="border-[#dfe5ef]" />
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="mb-[clamp(0.5rem,0.8vw,0.95rem)] text-[clamp(0.95rem,0.82vw,1.1rem)] font-medium leading-[150%] text-[#9CA3AF]">{title}</p>
  );
}

function CardHeader({
  title,
  action,
}: {
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)]">
      <h3 className="text-[clamp(0.98rem,0.85vw,1.15rem)] font-normal leading-[150%] text-[#4B5563]">{title}</h3>

      <button className="flex items-center gap-[clamp(0.25rem,0.45vw,0.55rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium leading-[150%] text-[#4F46E5] hover:opacity-80">
        {action}
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  iconBg,
  iconColor,
  border,
  bg,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} ${border} flex items-center gap-[clamp(0.65rem,1vw,1.2rem)] rounded-[clamp(0.58rem,0.66vw,0.95rem)] border px-[clamp(0.9rem,1vw,1.5rem)] py-[clamp(0.9rem,1vw,1.5rem)] transition hover:shadow-sm`}
    >
      <div
        className={`${iconBg} ${iconColor} flex h-[clamp(2.3rem,2.6vw,3.1rem)] w-[clamp(2.3rem,2.6vw,3.1rem)] items-center justify-center rounded-full`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-[clamp(0.98rem,0.85vw,1.15rem)] font-semibold leading-[150%] text-[#374151]">{title}</h3>

        <p className="mt-0.5 text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#9CA3AF]">{subtitle}</p>
      </div>
    </div>
  );
}

function SupportCard({
  title,
  description,
  bg,
  border,
  large,
}: {
  title: string;
  description: string;
  bg: string;
  border: string;
  large?: boolean;
}) {
  return (
    <div
      className={`${bg} ${border} relative overflow-hidden rounded-[clamp(0.72rem,0.78vw,1.12rem)] border p-[clamp(0.95rem,1.1vw,1.6rem)]`}
    >
      <h3 className="max-w-[clamp(13rem,14vw,20rem)] text-[clamp(0.98rem,0.9vw,1.2rem)] font-semibold leading-snug text-[#374151]">
        {title}
      </h3>

      <p className="mt-1.5 max-w-[clamp(13.5rem,15vw,21rem)] text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#6B7280]">
        {description}
      </p>

      <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.35rem,0.55vw,0.6rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium text-[#4B5563] transition hover:bg-[#FAFAFA]">
        <PlayCircle className="h-[clamp(0.85rem,1.1vw,1.15rem)] w-[clamp(0.85rem,1.1vw,1.15rem)]" />
        Watch video
      </button>

      {large && (
        <div className="absolute bottom-[clamp(0.6rem,1vw,1rem)] right-[clamp(0.8rem,1.2vw,1.4rem)]">
          <div className="relative flex h-[clamp(4.8rem,4.8vw,7rem)] w-[clamp(7rem,7vw,10rem)] items-center justify-center rounded-xl border border-[#D1D5DB] bg-white shadow-sm">
            <div className="flex h-[clamp(2.5rem,3vw,3.5rem)] w-[clamp(2.5rem,3vw,3.5rem)] items-center justify-center rounded-xl bg-[#FF5A5F] text-white shadow">
              <PlayCircle className="h-[clamp(1.25rem,1.6vw,1.75rem)] w-[clamp(1.25rem,1.6vw,1.75rem)] fill-white" />
            </div>

            <div className="absolute -left-5 top-0 h-10 w-10 rounded-full border-4 border-[#EAB308]" />
            <div className="absolute -right-2 top-2 h-3 w-3 rounded-full bg-[#FACC15]" />
            <div className="absolute -bottom-1 right-5 h-5 w-5 rounded-full border-4 border-[#EAB308]" />
          </div>
        </div>
      )}
    </div>
  );
}




