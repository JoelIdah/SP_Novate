 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, ChevronRight, ClipboardList, Compass, EllipsisVertical, MapPin, Search, Star } from "lucide-react";

import { DashboardNavbar } from "../dashboard/DashboardNavbar";
import ResponsiveSheet from "../ui/ResponsiveSheet";

type TutorCard = {
  name: string;
  title: string;
  rating: string;
  location: string;
  distance: string;
  subjects: string[];
  avatarBg: string;
  avatarText: string;
  initials: string;
};

type ManagedBookingRow = {
  date: string;
  tutor: string;
  department: string;
  subject: string;
  time: string;
  duration: string;
  status: "On-going" | "Pending";
};

const tutors: TutorCard[] = [
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #d7b58f 0%, #f1d8b7 100%)",
    avatarText: "#6a4a2e",
    initials: "OE",
  },
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #1f3a8a 0%, #2d62ff 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #134e4a 0%, #2dd4bf 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #111827 0%, #4b5563 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer - B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
];

const managedRows: ManagedBookingRow[] = [
  { date: "March 16, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "On-going" },
  { date: "March 16, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "On-going" },
  { date: "March 17, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 17, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 17, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 17, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 18, 2026", tutor: "Mr. Oluyinka Alabi", department: "Academics", subject: "Information Technology", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
];

export default function BookingsPage() {
  const [view, setView] = useState<"explore" | "manage">("manage");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [time, setTime] = useState("");
  const [rating, setRating] = useState("");

  const activeFilterCount = useMemo(
    () => [subject, category, location, days, time, rating].filter(Boolean).length,
    [subject, category, location, days, time, rating]
  );

  const resetFilters = () => {
    setSubject("");
    setCategory("");
    setLocation("");
    setDays("");
    setTime("");
    setRating("");
  };

  return (
    <main className="app-page-shell bg-white text-[#2b3245]">
      <DashboardNavbar active="Bookings" />

      <section className="app-page-wrap space-y-6 py-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.72rem] font-semibold ${
              view === "explore" ? "border-[#cfd6ee] bg-[#eef1ff] text-[#3f3cc4]" : "border-[#e0e4ef] bg-white text-[#6b7280]"
            }`}
            onClick={() => setView("explore")}
            type="button"
          >
            <Compass className="h-3.5 w-3.5" />
            Explore tutors
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.72rem] font-semibold ${
              view === "manage" ? "border-[#cfd6ee] bg-[#eef1ff] text-[#3f3cc4]" : "border-[#e0e4ef] bg-white text-[#6b7280]"
            }`}
            onClick={() => setView("manage")}
            type="button"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Manage bookings
          </button>
        </div>

        {view === "explore" ? (
          <div>
            <h1 className="text-[1.05rem] font-semibold text-[#2f3547]">Explore qualified tutors to help you achieve your learning goals.</h1>
            <p className="mt-1 text-[0.8rem] text-[#7c8498]">You can use the filter to help narrow down and pick your tutor.</p>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="sticky top-0 z-20 md:hidden">
          <button
            className="flex w-full items-center justify-between rounded-xl border border-[#dce3f0] bg-white/95 px-3 py-2.5 text-left shadow-sm backdrop-blur"
            onClick={() => setIsFilterOpen(true)}
            type="button"
          >
            <span className="inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#4a5166]">
              <Compass className="h-4 w-4 text-[#5f60d8]" />
              Filter tutors
            </span>
            <span className="rounded-full bg-[#eef0ff] px-2 py-0.5 text-[0.72rem] font-semibold text-[#4a46d6]">
              {activeFilterCount} active
            </span>
          </button>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="hidden rounded-2xl border border-[#e4e8f3] bg-[#f7f9fd] p-4 md:block">
          <div className="grid gap-3 md:grid-cols-3">
            <FilterSelect label="What do you want to learn" onSelect={setSubject} placeholder="Select subject" value={subject} />
            <FilterSelect label="What is the field category?" onSelect={setCategory} placeholder="Select department" value={category} />
            <FilterSelect label="Location" onSelect={setLocation} placeholder="Select department" value={location} />
            <FilterSelect label="Available days" onSelect={setDays} placeholder="Enter your email" value={days} />
            <FilterSelect label="Preferred time" onSelect={setTime} placeholder="Enter your email" value={time} />
            <FilterSelect label="Tutor rating" onSelect={setRating} placeholder="Select department" value={rating} />
          </div>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="pb-1">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ecf5] pb-3">
            <h2 className="text-[0.95rem] font-semibold text-[#3f4670]">Our tutors</h2>
            <div className="relative w-full max-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b4]" />
              <input
                className="h-8 w-full rounded-full border border-[#dfe4ee] bg-[#fbfcff] pl-8 pr-3 text-[0.7rem] text-[#4a5265] placeholder:text-[#b1b7c6]"
                placeholder="Search for tutors"
                type="search"
              />
            </div>
          </div>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="grid gap-4 lg:grid-cols-2">
          {tutors.map((tutor, index) => (
            <article
              key={`${tutor.name}-${index}`}
              className="rounded-2xl border border-[#e8ecf3] bg-[#f6f8fc] p-3.5"
            >
              <div className="ui-card px-3 py-3">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-16 w-16 shrink-0">
                    <div
                      className="h-16 w-16 overflow-hidden rounded-xl"
                      style={{
                        background: tutor.avatarBg,
                        color: tutor.avatarText,
                      }}
                    >
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
                        {tutor.initials}
                      </span>
                    </div>
                    <span className="absolute -bottom-2 left-3 flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white shadow">
                      <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                      {tutor.rating}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[0.9rem] font-semibold text-[#2d3448]">{tutor.name}</h3>
                        <p className="text-[0.7rem] text-[#8a92a6]">{tutor.title}</p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tutor.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="rounded-md border border-[#e3e7f1] bg-[#f2f4f9] px-2 py-0.5 text-[0.6rem] font-medium text-[#6b7280]"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.68rem] text-[#7b8197]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#6f6dd5]" />
                            {tutor.location}
                          </span>
                          <span className="text-[#a0a7b8]">-</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-[#4f566b]">{tutor.distance}</span>
                            <span>from you</span>
                          </span>
                        </div>
                      </div>

                      <Link className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#4f46e5]" href="/bookings/tutor-profile">
                        View profile
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap justify-end gap-2 px-1">
                <button
                  className="ui-btn-secondary min-w-[110px] px-4 py-2 text-[0.72rem] font-semibold"
                  type="button"
                >
                  Send message
                </button>
                <button
                  className="ui-btn-primary min-w-[110px] px-4 py-2 text-[0.72rem] font-semibold"
                  type="button"
                >
                  Book tutor
                </button>
              </div>
            </article>
          ))}
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[2rem] font-semibold leading-none text-[#2f3547]">Manage booking</h1>
              <Link
                className="inline-flex h-10 items-center gap-1 rounded-full bg-[#232066] px-4 text-[0.78rem] font-semibold text-white"
                href="/bookings/tutor-profile"
              >
                <Star className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1} />
                Book a session
              </Link>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-[360px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b4]" />
                <input
                  className="h-9 w-full rounded-full border border-[#e0e5f0] bg-white pl-9 pr-3 text-[0.76rem] text-[#4a5265] placeholder:text-[#b1b7c6]"
                  placeholder="Search tutor name or booking ID"
                  type="search"
                />
              </div>
              <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#e1e6f1] bg-white px-2.5 text-[0.68rem] font-semibold text-[#7a8299]" type="button">
                <CalendarDays className="h-3.5 w-3.5" />
                Sort
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-[#e7ebf4] pb-3">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-2 py-1 text-[0.64rem] font-semibold text-[#747e95]">
                Date
                <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center rounded-full bg-[#3236ad] px-2 py-1 text-[0.64rem] font-semibold text-white">12/03/2026- 16/03/2026</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-2 py-1 text-[0.64rem] font-semibold text-[#747e95]">
                Statuses
                <ChevronDown className="h-3 w-3" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#3236ad] px-2 py-1 text-[0.64rem] font-semibold text-white">
                Pending
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e3e8f2] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left text-[0.74rem] text-[#5f667b]">
                  <thead className="bg-[#f2f5fa] text-[#676f85]">
                    <tr>
                      {["Date", "Tutor", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => (
                        <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {managedRows.map((row, index) => (
                      <tr key={`${row.date}-${index}`} className="border-t border-[#edf0f6]">
                        <td className="px-3 py-2.5">{row.date}</td>
                        <td className="px-3 py-2.5">{row.tutor}</td>
                        <td className="px-3 py-2.5">{row.department}</td>
                        <td className="px-3 py-2.5">{row.subject}</td>
                        <td className="px-3 py-2.5">{row.time}</td>
                        <td className="px-3 py-2.5">{row.duration}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${row.status === "On-going" ? "bg-[#9a5cff]" : "bg-[#e7c754]"}`} />
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#6f768c]" type="button">
                            <EllipsisVertical className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-[#edf0f6] px-3 py-2.5 text-[0.68rem] text-[#6f768c]">
                <div className="flex items-center gap-1.5">
                  <button className="rounded-md border border-[#e2e7f2] px-2 py-1 text-[#5f667b]" type="button">Previous</button>
                  <button className="rounded-md border border-[#e2e7f2] px-2 py-1 text-[#5f667b]" type="button">Next</button>
                </div>
                <span>Page 1 of 10</span>
              </div>
            </div>
          </section>
        )}
      </section>

      <ResponsiveSheet mobileOnly open={view === "explore" && isFilterOpen} onClose={() => setIsFilterOpen(false)}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#d8dde8]" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.95rem] font-semibold text-[#3f4670]">Filter tutors</h3>
              <button className="text-[0.75rem] font-semibold text-[#7c8498]" onClick={resetFilters} type="button">Reset</button>
            </div>
            <div className="grid gap-3 overflow-y-auto pb-3">
              <FilterSelect label="What do you want to learn" onSelect={setSubject} placeholder="Select subject" value={subject} />
              <FilterSelect label="What is the field category?" onSelect={setCategory} placeholder="Select department" value={category} />
              <FilterSelect label="Location" onSelect={setLocation} placeholder="Select department" value={location} />
              <FilterSelect label="Available days" onSelect={setDays} placeholder="Enter your email" value={days} />
              <FilterSelect label="Preferred time" onSelect={setTime} placeholder="Enter your email" value={time} />
              <FilterSelect label="Tutor rating" onSelect={setRating} placeholder="Select department" value={rating} />
            </div>
            <div className="mt-auto flex gap-2 border-t border-[#eef1f6] bg-white py-3">
              <button className="h-11 flex-1 rounded-full bg-[#ececef] text-[0.82rem] font-semibold text-[#4e576d]" onClick={() => setIsFilterOpen(false)} type="button">
                Cancel
              </button>
              <button className="h-11 flex-1 rounded-full bg-[#232066] text-[0.82rem] font-semibold text-white" onClick={() => setIsFilterOpen(false)} type="button">
                Apply
              </button>
            </div>
      </ResponsiveSheet>
    </main>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <label className="text-[0.7rem] font-semibold text-[#8891a7]">
      <span className="mb-1 block">{label}</span>
      <button
        className="flex w-full items-center justify-between rounded-lg border border-[#dfe5f2] bg-white px-3 py-2 text-[0.75rem] font-medium text-[#7a8195]"
        onClick={() => onSelect(value ? "" : placeholder)}
        type="button"
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-[#9aa1b4]" />
      </button>
    </label>
  );
}

