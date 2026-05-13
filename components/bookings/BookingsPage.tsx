import Link from "next/link";
import { ChevronDown, ChevronRight, ClipboardList, Clock, Compass, MapPin, Search, Star } from "lucide-react";

import { DashboardNavbar } from "../dashboard/DashboardNavbar";

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

const tutors: TutorCard[] = [
  {
    name: "Oluyinka Emmanuel",
    title: "Software engineer • B.Sc, M.Sc",
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
    title: "Software engineer • B.Sc, M.Sc",
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
    title: "Software engineer • B.Sc, M.Sc",
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
    title: "Software engineer • B.Sc, M.Sc",
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
    title: "Software engineer • B.Sc, M.Sc",
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
    title: "Software engineer • B.Sc, M.Sc",
    rating: "4.5",
    location: "Omni, Victoria Island",
    distance: "5km from you",
    subjects: ["Mathematics", "Physics", "Further mathematics"],
    avatarBg: "linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)",
    avatarText: "#ffffff",
    initials: "OE",
  },
];

export default function BookingsPage() {
  return (
    <main className="app-page-shell bg-[#f6f7fb] text-[#2b3245]">
      <DashboardNavbar active="Bookings" />

      <section className="app-page-wrap space-y-6 py-6">
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-[#cfd6ee] bg-[#eef1ff] px-4 py-1.5 text-[0.72rem] font-semibold text-[#3f3cc4]" type="button">
            <Compass className="h-3.5 w-3.5" />
            Explore tutors
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-[#e0e4ef] bg-white px-4 py-1.5 text-[0.72rem] font-semibold text-[#6b7280]" type="button">
            <ClipboardList className="h-3.5 w-3.5" />
            Manage bookings
          </button>
        </div>

        <div>
          <h1 className="text-[1.05rem] font-semibold text-[#2f3547]">Explore qualified tutors to help you achieve your learning goals.</h1>
          <p className="mt-1 text-[0.8rem] text-[#7c8498]">You can use the filter to help narrow down and pick your tutor.</p>
        </div>

        <div className="rounded-2xl border border-[#e4e8f3] bg-[#f7f9fd] p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FilterSelect label="What do you want to learn" placeholder="Select subject" />
            <FilterSelect label="What is the field category?" placeholder="Select department" />
            <FilterSelect label="Location" placeholder="Select department" />
            <FilterSelect label="Available days" placeholder="Enter your email" />
            <FilterSelect label="Preferred time" placeholder="Enter your email" />
            <FilterSelect label="Tutor rating" placeholder="Select department" />
          </div>
        </div>

        <div className="border-t border-[#e8ecf5] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.95rem] font-semibold text-[#4b5563]">Our tutors</h2>
            <div className="relative w-full max-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b4]" />
              <input
                className="h-8 w-full rounded-full border border-[#e0e4ef] bg-white pl-8 pr-3 text-[0.7rem] text-[#4a5265] placeholder:text-[#9aa1b4]"
                placeholder="Search for tutors"
                type="search"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {tutors.map((tutor, index) => (
            <article
              key={`${tutor.name}-${index}`}
              className="rounded-2xl border border-[#e6e9f2] bg-white p-4 shadow-[0_6px_18px_rgba(23,35,68,0.04)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-16 w-16 shrink-0">
                  <div
                    className="h-16 w-16 overflow-hidden rounded-2xl"
                    style={{
                      background: tutor.avatarBg,
                      color: tutor.avatarText,
                    }}
                  >
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
                      {tutor.initials}
                    </span>
                  </div>
                  <span className="absolute -bottom-2 left-0 flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white shadow">
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
                            className="rounded-full border border-[#e3e7f1] bg-[#f2f4f9] px-2.5 py-1 text-[0.62rem] font-semibold text-[#6b7280]"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.68rem] text-[#7b8197]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#6f6dd5]" />
                          {tutor.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#6f6dd5]" />
                          {tutor.distance}
                        </span>
                      </div>
                    </div>

                    <Link className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#4f46e5]" href="#">
                      View profile
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      className="min-w-[110px] rounded-full border border-[#e2e6f0] bg-white px-4 py-2 text-[0.72rem] font-semibold text-[#5a6174]"
                      type="button"
                    >
                      Send message
                    </button>
                    <button
                      className="min-w-[110px] rounded-full border border-[#3b39ad] bg-[#4341bf] px-4 py-2 text-[0.72rem] font-semibold text-white"
                      type="button"
                    >
                      Book tutor
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function FilterSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="text-[0.7rem] font-semibold text-[#8891a7]">
      <span className="mb-1 block">{label}</span>
      <button
        className="flex w-full items-center justify-between rounded-lg border border-[#dfe5f2] bg-white px-3 py-2 text-[0.75rem] font-medium text-[#7a8195]"
        type="button"
      >
        <span>{placeholder}</span>
        <ChevronDown className="h-4 w-4 text-[#9aa1b4]" />
      </button>
    </label>
  );
}
