 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, ChevronRight, ClipboardList, Compass, EllipsisVertical, MapPin, Search, Star } from "lucide-react";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import ResponsiveSheet from "../ui/ResponsiveSheet";
import { DataTableShell } from "../ui/DataTableShell";

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

type BookingView = "explore" | "manage";

export default function BookingsPage({ initialView = "explore", notice }: { initialView?: BookingView; notice?: string }) {
  const router = useRouter();
  const [view, setView] = useState<BookingView>(initialView);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState("");
  const [manageQuery, setManageQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [time, setTime] = useState("");
  const [rating, setRating] = useState("");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ManagedBookingRow["status"] | "All">("All");
  const activeFilterCount = useMemo(
    () => [subject, category, location, days, time, rating].filter(Boolean).length,
    [subject, category, location, days, time, rating]
  );
  const filteredTutors = useMemo(() => {
    const query = tutorQuery.trim().toLowerCase();
    return tutors.filter((tutor) => {
      const queryPass = !query || [tutor.name, tutor.title, tutor.location, ...tutor.subjects].some((value) => value.toLowerCase().includes(query));
      const subjectPass = !subject || tutor.subjects.some((value) => value.toLowerCase().includes(subject.toLowerCase()));
      const locationPass = !location || tutor.location.toLowerCase().includes(location.toLowerCase());
      const ratingPass = !rating || Number(tutor.rating) >= Number(rating);
      return queryPass && subjectPass && locationPass && ratingPass;
    });
  }, [location, rating, subject, tutorQuery]);
  const filteredManagedRows = useMemo(() => {
    const query = manageQuery.trim().toLowerCase();
    const rows = managedRows.filter((row) => {
      const statusPass = selectedStatus === "All" ? true : row.status === selectedStatus;
      const queryPass = !query || [row.tutor, row.department, row.subject, row.status].some((value) => value.toLowerCase().includes(query));
      const rowDate = new Date(row.date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      const fromPass = from ? rowDate >= from : true;
      const toPass = to ? rowDate <= to : true;
      const datePass = !Number.isNaN(rowDate.valueOf()) && fromPass && toPass;
      return statusPass && datePass && queryPass;
    });
    return newestFirst ? [...rows].reverse() : rows;
  }, [dateFrom, dateTo, manageQuery, newestFirst, selectedStatus]);

  const formatRangeLabel = dateFrom || dateTo
    ? `${dateFrom ? dateFrom.replaceAll("-", "/") : "..."} - ${dateTo ? dateTo.replaceAll("-", "/") : "..."}`
    : "All dates";

  const resetFilters = () => {
    setSubject("");
    setCategory("");
    setLocation("");
    setDays("");
    setTime("");
    setRating("");
  };

  const changeView = (nextView: BookingView) => {
    setView(nextView);
    router.replace(nextView === "manage" ? "/students/bookings?view=manage" : "/students/bookings", { scroll: false });
  };

  return (
    <>
      <DashboardShell
        mainClassName="scrollbar-hover"
        navbar={<StudentDashboardNavbar active="Bookings" />}
      >
        <section className={`w-full py-4 md:py-5 ${view === "manage" ? "flex min-h-full flex-col" : "space-y-5 2xl:space-y-6"}`}>
        <div className="flex flex-wrap gap-[0.55em]">
          <button
            className={`inline-flex min-h-11 items-center gap-[0.55em] rounded-full border px-[1em] py-[0.45em] text-[0.74em] font-semibold md:min-h-9 ${
              view === "explore" ? "border-[#cfd6ee] bg-[#eef1ff] text-[#3f3cc4]" : "border-[#e0e4ef] bg-white text-[#6b7280]"
            }`}
            onClick={() => changeView("explore")}
            type="button"
          >
            <Compass className="h-[0.95em] w-[0.95em]" />
            Explore tutors
          </button>
          <button
            className={`inline-flex min-h-11 items-center gap-[0.55em] rounded-full border px-[1em] py-[0.45em] text-[0.74em] font-semibold md:min-h-9 ${
              view === "manage" ? "border-[#cfd6ee] bg-[#eef1ff] text-[#3f3cc4]" : "border-[#e0e4ef] bg-white text-[#6b7280]"
            }`}
            onClick={() => changeView("manage")}
            type="button"
          >
            <ClipboardList className="h-[0.95em] w-[0.95em]" />
            Manage bookings
          </button>
        </div>

        {view === "explore" ? (
          <div>
            <h1 className="text-[1.12em] font-semibold text-[#2f3547]">Explore qualified tutors to help you achieve your learning goals.</h1>
            <p className="mt-[0.45em] text-[0.84em] text-[#7c8498]">You can use the filter to help narrow down and pick your tutor.</p>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="sticky top-0 z-20 md:hidden">
          <button
            className="flex w-full items-center justify-between rounded-xl border border-[#dce3f0] bg-white/95 px-3 py-2.5 text-left shadow-sm backdrop-blur"
            onClick={() => setIsFilterOpen(true)}
            type="button"
          >
            <span className="inline-flex items-center gap-2 text-[0.82em] font-semibold text-[#4a5166]">
              <Compass className="h-[1em] w-[1em] text-[#5f60d8]" />
              Filter tutors
            </span>
            <span className="rounded-full bg-[#eef0ff] px-2 py-0.5 text-[0.72em] font-semibold text-[#4a46d6]">
              {activeFilterCount} active
            </span>
          </button>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="hidden rounded-2xl border border-[#e4e8f3] bg-[#f7f9fd] p-[1em] md:block">
          <div className="grid gap-[0.7em] md:grid-cols-3">
            <FilterSelect label="What do you want to learn" onSelect={setSubject} options={["Mathematics", "Physics", "Further mathematics"]} placeholder="Select subject" value={subject} />
            <FilterSelect label="What is the field category?" onSelect={setCategory} options={["Academics", "Entrance exams", "Languages"]} placeholder="Select category" value={category} />
            <FilterSelect label="Location" onSelect={setLocation} options={["Victoria Island", "Lagos Island", "Remote"]} placeholder="Select location" value={location} />
            <FilterSelect label="Available days" onSelect={setDays} options={["Monday", "Wednesday", "Friday"]} placeholder="Select a day" value={days} />
            <FilterSelect label="Preferred time" onSelect={setTime} options={["Morning", "Afternoon", "Evening"]} placeholder="Select a time" value={time} />
            <FilterSelect label="Tutor rating" onSelect={setRating} options={["4", "4.5"]} placeholder="Select minimum rating" value={rating} />
          </div>
          </div>
        ) : null}

        {view === "explore" ? (
          <div className="pb-[0.2em]">
          <div className="flex items-center justify-between gap-[0.8em] border-b border-[#e8ecf5] pb-[0.7em]">
            <h2 className="text-[1.02em] font-semibold text-[#3f4670]">Our tutors</h2>
            <div className="relative w-full max-w-[17em]">
              <Search className="pointer-events-none absolute left-[0.9em] top-1/2 h-[1em] w-[1em] -translate-y-1/2 text-[#9aa1b4]" />
              <input
                className="h-[2.35em] w-full rounded-full border border-[#dfe4ee] bg-[#fbfcff] pl-[2.4em] pr-[0.9em] text-[0.74em] text-[#4a5265] placeholder:text-[#b1b7c6]"
                placeholder="Search for tutors"
                type="search"
                onChange={(event) => setTutorQuery(event.target.value)}
                value={tutorQuery}
              />
            </div>
          </div>
          </div>
        ) : null}

        {view === "explore" ? (
            <div className="grid gap-[1.1em] xl:grid-cols-2 2xl:grid-cols-3">
          {filteredTutors.map((tutor, index) => (
            <article
              key={`${tutor.name}-${index}`}
              className="min-h-[10.5em] rounded-2xl border border-[#e8ecf3] bg-[#f6f8fc] p-[1em]"
            >
              <Link className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent" href="/students/bookings/tutor-profile">
              <Card className="px-[0.9em] py-[0.9em] transition hover:border-[#cfd5e7]">
                <div className="flex flex-col gap-[0.8em] sm:flex-row sm:items-start">
                  <div className="relative h-[3.6em] w-[3.6em] shrink-0">
                    <Avatar
                      alt={tutor.name}
                       className="h-[3.6em] w-[3.6em] overflow-hidden rounded-[0.7em]"
                      initials={tutor.initials}
                      randomImage
                      randomSeed={`${tutor.name}-${index}`}
                    />
                    <span className="absolute -bottom-[0.55em] left-[0.7em] flex items-center gap-[0.25em] rounded-full bg-[#1b1848] px-[0.55em] py-[0.2em] text-[0.62em] font-semibold text-white shadow">
                      <Star className="h-[0.85em] w-[0.85em] text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                      {tutor.rating}
                    </span>
                  </div>

                  <div className="flex-1">
                     <div className="flex flex-wrap items-start justify-between gap-[0.7em]">
                      <div>
                        <h3 className="text-[0.9em] font-semibold text-[#2d3448]">{tutor.name}</h3>
                        <p className="text-[0.7em] text-[#8a92a6]">{tutor.title}</p>

                        <div className="mt-[0.45em] flex flex-wrap gap-[0.35em]">
                          {tutor.subjects.map((subject) => (
                            <span
                              key={subject}
                                className="rounded-md border border-[#e3e7f1] bg-[#f2f4f9] px-[0.55em] py-[0.2em] text-[0.62em] font-medium text-[#6b7280]"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>

                        <div className="mt-[0.45em] flex flex-wrap items-center gap-[0.4em] text-[0.7em] text-[#7b8197]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-[0.95em] w-[0.95em] text-[#6f6dd5]" />
                            {tutor.location}
                          </span>
                          <span className="text-[#a0a7b8]">-</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-[#4f566b]">{tutor.distance}</span>
                            <span>from you</span>
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[0.7em] font-semibold text-[#4f46e5]">
                        View profile
                        <ChevronRight className="h-[0.85em] w-[0.85em]" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              </Link>

               <div className="mt-[0.7em] flex flex-wrap justify-end gap-[0.45em] px-[0.2em]">
                <Link className="inline-flex min-h-11 min-w-[8.5em] items-center justify-center rounded-full border border-ui-border bg-white px-[0.95em] py-[0.55em] text-[0.72em] font-semibold text-ui-body hover:bg-[#f7f8fb] md:min-h-10" href="/students/chat?contact=1">
                  Send message
                </Link>
                <Link className="inline-flex min-h-11 min-w-[8.5em] items-center justify-center rounded-full border border-brand-primary bg-brand-primary px-[0.95em] py-[0.55em] text-[0.72em] font-semibold text-white hover:bg-[#1c175f] md:min-h-10" href="/students/bookings/tutor-profile?book=1">
                  Book tutor
                </Link>
              </div>
            </article>
          ))}
          {filteredTutors.length === 0 ? <p className="col-span-full rounded-2xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-4 py-10 text-center text-sm text-[#747d92]">No tutors match your search and filters.</p> : null}
          </div>
        ) : (
          <section className="flex flex-col space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[2em] font-semibold leading-none text-[#2f3547]">Manage booking</h1>
              <button
                className="inline-flex h-10 items-center gap-1 rounded-full bg-[#232066] px-4 text-[0.78em] font-semibold text-white"
                onClick={() => changeView("explore")}
                type="button"
              >
                <Star className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1} />
                Book a session
              </button>
            </div>

            {notice === "booking_submitted" ? (
              <p className="rounded-xl border border-[#bde8d0] bg-[#effaf4] px-4 py-3 text-sm font-medium text-[#20784d]" role="status">Your booking request was submitted. You can track it here.</p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-[230px] md:max-w-[280px] xl:max-w-[360px] 2xl:max-w-[440px] [@media(min-width:2100px)]:max-w-[860px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b4]" />
                <input
                  className="h-11 w-full rounded-full border border-[#e0e5f0] bg-white pl-9 pr-3 text-[0.76em] text-[#4a5265] placeholder:text-[#b1b7c6] md:h-8"
                  placeholder="Search tutor name or booking ID"
                  type="search"
                  onChange={(event) => setManageQuery(event.target.value)}
                  value={manageQuery}
                />
              </div>
              <button className="inline-flex h-11 items-center gap-1 rounded-lg border border-[#e1e6f1] bg-white px-3 text-[0.68em] font-semibold text-[#7a8299] md:h-8" onClick={() => setNewestFirst((current) => !current)} type="button">
                <CalendarDays className="h-3.5 w-3.5" />
                {newestFirst ? "Newest" : "Oldest"}
              </button>
            </div>

            <div className="relative flex flex-wrap items-center gap-2 border-b border-[#e7ebf4] pb-3 md:gap-2.5">
              <div className="relative">
                <button
                  className="inline-flex h-11 items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-3 text-[0.68em] font-semibold text-[#747e95] md:h-8"
                  onClick={() => {
                    setIsDateMenuOpen((prev) => !prev);
                    setIsStatusMenuOpen(false);
                  }}
                  type="button"
                >
                  Date
                  <ChevronDown className="h-3 w-3" />
                </button>
                {isDateMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[16.25rem] rounded-xl border border-[#dfe4ef] bg-white p-3 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[19rem] 2xl:p-4">
                    <p className="mb-2 text-[0.78rem] font-semibold text-[#55607a] 2xl:mb-2.5 2xl:text-[0.92rem]">Pick date range</p>
                    <label className="mb-2 block text-[0.72rem] font-semibold text-[#7a8299] 2xl:mb-2.5 2xl:text-[0.84rem]">
                      From
                      <input
                        className="mt-1 h-9 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] 2xl:mt-1.5 2xl:h-10 2xl:text-[0.9rem]"
                        onChange={(e) => setDateFrom(e.target.value)}
                        type="date"
                        value={dateFrom}
                      />
                    </label>
                    <label className="block text-[0.72rem] font-semibold text-[#7a8299] 2xl:text-[0.84rem]">
                      To
                      <input
                        className="mt-1 h-9 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] 2xl:mt-1.5 2xl:h-10 2xl:text-[0.9rem]"
                        onChange={(e) => setDateTo(e.target.value)}
                        type="date"
                        value={dateTo}
                      />
                    </label>
                  </div>
                ) : null}
              </div>
              <span className="inline-flex h-7 items-center rounded-full bg-[#3236ad] px-3 text-[0.68em] font-semibold text-white">{formatRangeLabel}</span>
              <div className="relative">
                <button
                  className="inline-flex h-11 items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-3 text-[0.68em] font-semibold text-[#747e95] md:h-8"
                  onClick={() => {
                    setIsStatusMenuOpen((prev) => !prev);
                    setIsDateMenuOpen(false);
                  }}
                  type="button"
                >
                  Statuses
                  <ChevronDown className="h-3 w-3" />
                </button>
                {isStatusMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[11.9rem] rounded-xl border border-[#dfe4ef] bg-white p-2 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[13.8rem] 2xl:p-2.5">
                    {(["All", "On-going", "Pending"] as const).map((status) => (
                      <button
                        key={status}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[0.78rem] 2xl:px-2.5 2xl:py-2 2xl:text-[0.92rem] ${
                          selectedStatus === status ? "bg-[#eef0ff] text-[#2f34aa]" : "text-[#5f667b]"
                        }`}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusMenuOpen(false);
                        }}
                        type="button"
                      >
                        {status}
                        {selectedStatus === status ? <span>{"\u2713"}</span> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-[#3236ad] px-3 text-[0.68em] font-semibold text-white">
                {selectedStatus}
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            <DataTableShell>
                <table className="w-full min-w-[920px] border-collapse text-left text-[0.74em] text-[#5f667b]">
                  <thead className="bg-[#f2f5fa] text-[#676f85]">
                    <tr>
                      {["Date", "Tutor", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => (
                        <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManagedRows.map((row, index) => {
                      const originalIndex = managedRows.indexOf(row);
                      const rowIndex = originalIndex >= 0 ? originalIndex : index;
                      return (
                      <tr
                        key={`${row.date}-${rowIndex}`}
                        className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]"
                        onClick={() => {
                          router.push(`/students/bookings/manage/${rowIndex + 1}`);
                        }}
                      >
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
                          <button
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#6f768c]"
                            onClick={(e) => e.stopPropagation()}
                            type="button"
                          >
                            <EllipsisVertical className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
            </DataTableShell>

            <div className="space-y-1.5 pb-6 md:hidden">
              {filteredManagedRows.map((row, index) => {
                const originalIndex = managedRows.indexOf(row);
                const rowIndex = originalIndex >= 0 ? originalIndex : index;
                return (
                <Link
                  key={`${row.date}-${rowIndex}`}
                  className="block rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2"
                  href={`/students/bookings/manage/${rowIndex + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.78em] font-semibold text-[#2f3547]">{row.tutor}</p>
                      <p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">{row.subject} - {row.time}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[0.66em] text-[#5f667b]">
                        <span className={`h-1.5 w-1.5 rounded-full ${row.status === "On-going" ? "bg-[#9a5cff]" : "bg-[#e7c754]"}`} />
                        {row.status}
                      </span>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6f768c]" aria-hidden>
                        <EllipsisVertical className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[0.66em] text-[#596177]">
                    <span>{row.date}</span>
                    <span>{row.duration}</span>
                  </div>
                </Link>
                );
              })}
            </div>
          </section>
        )}
        </section>
      </DashboardShell>

      <ResponsiveSheet mobileOnly open={view === "explore" && isFilterOpen} onClose={() => setIsFilterOpen(false)}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#d8dde8]" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.95em] font-semibold text-[#3f4670]">Filter tutors</h3>
              <button className="text-[0.75em] font-semibold text-[#7c8498]" onClick={resetFilters} type="button">Reset</button>
            </div>
            <div className="grid gap-3 overflow-y-auto pb-3">
              <FilterSelect label="What do you want to learn" onSelect={setSubject} options={["Mathematics", "Physics", "Further mathematics"]} placeholder="Select subject" value={subject} />
              <FilterSelect label="What is the field category?" onSelect={setCategory} options={["Academics", "Entrance exams", "Languages"]} placeholder="Select category" value={category} />
              <FilterSelect label="Location" onSelect={setLocation} options={["Victoria Island", "Lagos Island", "Remote"]} placeholder="Select location" value={location} />
              <FilterSelect label="Available days" onSelect={setDays} options={["Monday", "Wednesday", "Friday"]} placeholder="Select a day" value={days} />
              <FilterSelect label="Preferred time" onSelect={setTime} options={["Morning", "Afternoon", "Evening"]} placeholder="Select a time" value={time} />
              <FilterSelect label="Tutor rating" onSelect={setRating} options={["4", "4.5"]} placeholder="Select minimum rating" value={rating} />
            </div>
            <div className="mt-auto flex gap-2 border-t border-[#eef1f6] bg-white py-3">
              <button className="h-11 flex-1 rounded-full bg-[#ececef] text-[0.82em] font-semibold text-[#4e576d]" onClick={() => setIsFilterOpen(false)} type="button">
                Cancel
              </button>
              <button className="h-11 flex-1 rounded-full bg-[#232066] text-[0.82em] font-semibold text-white" onClick={() => setIsFilterOpen(false)} type="button">
                Apply
              </button>
            </div>
      </ResponsiveSheet>
    </>
  );
}

function FilterSelect({
  label,
  placeholder,
  value,
  options,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (next: string) => void;
}) {
  return (
    <label className="text-[0.74em] font-semibold text-[#8891a7]">
      <span className="mb-[0.35em] block">{label}</span>
      <span className="relative block">
        <select className="h-11 w-full appearance-none rounded-lg border border-[#dfe5f2] bg-white px-[0.8em] pr-9 text-[0.78em] font-medium text-[#7a8195] md:h-[2.65em]" onChange={(event) => onSelect(event.target.value)} value={value}>
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}{label === "Tutor rating" ? "+ stars" : ""}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1b4]" />
      </span>
    </label>
  );
}





