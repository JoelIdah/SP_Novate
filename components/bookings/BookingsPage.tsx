 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, ClipboardList, Compass, EllipsisVertical, MapPin, Search, Star } from "lucide-react";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import ResponsiveSheet from "../ui/ResponsiveSheet";
import { DataTableShell } from "../ui/DataTableShell";
import { TableFilters } from "../ui/TableFilters";
import { SelectMenu } from "../ui/SelectMenu";
import { apiFetch } from "../auth/apiClient";

type StudentCategory = {
  department: string;
  public_id: string;
  subjects: Array<{
    created_at: string;
    subject: string;
    updated_at: string;
  }>;
};

type CategoriesResponse = {
  code?: number;
  data?: StudentCategory[];
  message?: string;
  status?: string;
};

type TutorCard = {
  publicId: string;
  name: string;
  title: string;
  rating: string;
  ratingCount: number;
  location: string;
  distance: string;
  subjects: string[];
  profilePhoto: string;
  initials: string;
};

type TutorApiItem = {
  address?: string;
  average_rating?: number;
  distance_km?: number | null;
  name?: string;
  occupation?: string;
  profile_photo?: string;
  public_id?: string;
  qualifications?: string[];
  rating_count?: number;
  subjects?: Array<{ department?: string; subject?: string }>;
};

type TutorsResponse = {
  data?: { data?: TutorApiItem[]; page?: number; page_size?: number; total?: number; total_pages?: number };
  message?: string;
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

function mapTutor(item: TutorApiItem): TutorCard {
  const name = item.name?.trim() || "Tutor";
  const nameParts = name.split(/\s+/).filter(Boolean);
  const qualifications = Array.isArray(item.qualifications) ? item.qualifications.filter(Boolean) : [];
  const titleParts = [item.occupation?.trim(), qualifications.join(", ")].filter(Boolean);
  return {
    publicId: item.public_id?.trim() ?? "",
    name,
    title: titleParts.join(" - ") || "Tutor profile",
    rating: typeof item.average_rating === "number" ? item.average_rating.toFixed(1) : "0.0",
    ratingCount: typeof item.rating_count === "number" ? item.rating_count : 0,
    location: item.address?.trim() || "Location not provided",
    distance: typeof item.distance_km === "number" ? `${item.distance_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km` : "",
    subjects: (item.subjects ?? []).map((entry) => entry.subject?.trim() ?? "").filter(Boolean),
    profilePhoto: item.profile_photo?.trim() ?? "",
    initials: nameParts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "T",
  };
}

export default function BookingsPage({ initialView = "explore", notice }: { initialView?: BookingView; notice?: string }) {
  const router = useRouter();
  const [view, setView] = useState<BookingView>(initialView);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tutorQuery, setTutorQuery] = useState("");
  const [debouncedTutorQuery, setDebouncedTutorQuery] = useState("");
  const [tutorCards, setTutorCards] = useState<TutorCard[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [tutorsError, setTutorsError] = useState("");
  const [tutorsPage, setTutorsPage] = useState(1);
  const [tutorsTotalPages, setTutorsTotalPages] = useState(0);
  const [tutorsRefreshKey, setTutorsRefreshKey] = useState(0);
  const [manageQuery, setManageQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<StudentCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [days, setDays] = useState("");
  const [rating, setRating] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ManagedBookingRow["status"] | "All">("All");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTutorsPage(1);
      setDebouncedTutorQuery(tutorQuery.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [tutorQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const response = await apiFetch("/v1/categories", { signal: controller.signal });
        const result = (await response.json()) as CategoriesResponse;
        if (!response.ok) throw new Error(result.message ?? "Could not load learning categories.");
        setCategories(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCategories([]);
        setCategoriesError(error instanceof Error ? error.message : "Could not load learning categories.");
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (view !== "explore") return;
    const controller = new AbortController();
    const loadTutors = async () => {
      setTutorsLoading(true);
      setTutorsError("");
      try {
        const params = new URLSearchParams({ page: String(tutorsPage), page_size: "20" });
        // Staging registers the browse collection with a trailing slash. Calling
        // the slashless path produces a 301 without CORS headers, which browsers
        // surface as a CORS failure before the authenticated request can finish.
        let path = "/v1/student/explore/";
        if (debouncedTutorQuery) {
          path = "/v1/student/explore/search";
          params.set("name", debouncedTutorQuery);
        } else {
          if (category) params.set("department", category);
          if (subject) params.set("subject", subject);
          if (days) params.append("days", days.toLowerCase());
          if (rating) params.set("min_rating", rating);
        }
        const response = await apiFetch(`${path}?${params.toString()}`, { signal: controller.signal });
        const result = (await response.json().catch(() => null)) as TutorsResponse | null;
        if (!response.ok) throw new Error(result?.message ?? "Could not load tutors.");
        const nextTutors = (result?.data?.data ?? []).map(mapTutor);
        setTutorCards((current) => {
          if (tutorsPage === 1) return nextTutors;
          const combined = [...current, ...nextTutors];
          return combined.filter((tutor, index) => combined.findIndex((candidate) => candidate.publicId ? candidate.publicId === tutor.publicId : candidate.name === tutor.name) === index);
        });
        setTutorsTotalPages(result?.data?.total_pages ?? 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (tutorsPage === 1) setTutorCards([]);
        setTutorsError(error instanceof Error ? error.message : "Could not load tutors.");
      } finally {
        if (!controller.signal.aborted) setTutorsLoading(false);
      }
    };
    void loadTutors();
    return () => controller.abort();
  }, [category, days, debouncedTutorQuery, rating, subject, tutorsPage, tutorsRefreshKey, view]);

  const categoryOptions = useMemo(() => categories.map((item) => item.department).filter(Boolean), [categories]);
  const selectedCategory = useMemo(() => categories.find((item) => item.department === category), [categories, category]);
  const subjectOptions = useMemo(() => {
    const source = selectedCategory ? selectedCategory.subjects : categories.flatMap((item) => item.subjects);
    return [...new Set(source.map((item) => item.subject).filter(Boolean))].sort((first, second) => first.localeCompare(second));
  }, [categories, selectedCategory]);
  const activeFilterCount = useMemo(
    () => [subject, category, days, rating].filter(Boolean).length,
    [subject, category, days, rating]
  );
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

  const resetFilters = () => {
    setSubject("");
    setCategory("");
    setDays("");
    setRating("");
    setTutorsPage(1);
  };

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setTutorsPage(1);
    const nextSubjects = categories.find((item) => item.department === nextCategory)?.subjects.map((item) => item.subject) ?? [];
    if (subject && nextCategory && !nextSubjects.includes(subject)) setSubject("");
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
          {categoriesError ? <p className="mb-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]" role="alert">{categoriesError}</p> : null}
          <div className="grid gap-[0.7em] md:grid-cols-2 xl:grid-cols-4">
            <FilterSelect disabled={categoriesLoading || subjectOptions.length === 0} label="What do you want to learn" onSelect={(value) => { setSubject(value); setTutorsPage(1); }} options={subjectOptions} placeholder={categoriesLoading ? "Loading subjects..." : "Select subject"} value={subject} />
            <FilterSelect disabled={categoriesLoading || categoryOptions.length === 0} label="What is the field category?" onSelect={selectCategory} options={categoryOptions} placeholder={categoriesLoading ? "Loading categories..." : "Select category"} value={category} />
            <FilterSelect label="Available days" onSelect={(value) => { setDays(value); setTutorsPage(1); }} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} placeholder="Select a day" value={days} />
            <FilterSelect label="Tutor rating" onSelect={(value) => { setRating(value); setTutorsPage(1); }} options={["3", "4", "4.5"]} placeholder="Select minimum rating" value={rating} />
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
          {tutorsError ? <div className="col-span-full flex items-center justify-between gap-3 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3 text-sm font-medium text-[#8b5a20]" role="alert"><span>{tutorsError}</span><button className="shrink-0 font-semibold underline" onClick={() => setTutorsRefreshKey((current) => current + 1)} type="button">Try again</button></div> : null}
          {tutorsLoading && tutorCards.length === 0 ? Array.from({ length: 4 }, (_, index) => <TutorCardSkeleton key={`tutor-skeleton-${index}`} />) : null}
          {tutorCards.map((tutor, index) => (
            <article
              key={tutor.publicId || `${tutor.name}-${index}`}
              className="min-h-[10.5em] rounded-2xl border border-[#e8ecf3] bg-[#f6f8fc] p-[1em]"
            >
              <Link className="block rounded-xl" href={`/students/bookings/tutor-profile?tutorId=${encodeURIComponent(tutor.publicId)}`}>
              <Card className="px-[0.9em] py-[0.9em] transition hover:border-[#cfd5e7]">
                <div className="flex flex-col gap-[0.8em] sm:flex-row sm:items-start">
                  <div className="relative h-[3.6em] w-[3.6em] shrink-0">
                    <Avatar
                      alt={tutor.name}
                       className="h-[3.6em] w-[3.6em] overflow-hidden rounded-[0.7em]"
                      initials={tutor.initials}
                      randomImage={!tutor.profilePhoto}
                      randomSeed={tutor.publicId || `${tutor.name}-${index}`}
                      src={tutor.profilePhoto || undefined}
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
                          {tutor.distance ? <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-[#4f566b]">{tutor.distance}</span>
                            <span>from you</span>
                          </span> : <span>Distance unavailable</span>}
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
                <Link className="inline-flex min-h-11 min-w-[8.5em] items-center justify-center rounded-full border border-ui-border bg-white px-[0.95em] py-[0.55em] text-[0.72em] font-semibold text-ui-body hover:bg-[#f7f8fb] md:min-h-10" href={`/students/chat?contact=${encodeURIComponent(tutor.publicId)}`}>
                  Send message
                </Link>
                <Link className="inline-flex min-h-11 min-w-[8.5em] items-center justify-center rounded-full border border-brand-primary bg-brand-primary px-[0.95em] py-[0.55em] text-[0.72em] font-semibold text-white hover:bg-[#1c175f] md:min-h-10" href={`/students/bookings/tutor-profile?tutorId=${encodeURIComponent(tutor.publicId)}&book=1`}>
                  Book tutor
                </Link>
              </div>
            </article>
          ))}
          {!tutorsLoading && !tutorsError && tutorCards.length === 0 ? <p className="col-span-full rounded-2xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-4 py-10 text-center text-sm text-[#747d92]">{debouncedTutorQuery ? "No tutors match that name." : "No tutors match the selected filters."}</p> : null}
          {tutorsLoading && tutorCards.length > 0 ? <p className="col-span-full flex items-center justify-center gap-2 py-3 text-xs text-[#8a93a7]" role="status"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d6daf0] border-t-[#4d43d7]" />Loading more tutors</p> : null}
          <InfiniteTutorScroll enabled={!tutorsLoading && tutorsPage < tutorsTotalPages} onVisible={() => setTutorsPage((current) => current + 1)} />
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

            <TableFilters
              dateFrom={dateFrom}
              dateTo={dateTo}
              filters={[{ label: "Status", value: selectedStatus, options: ["All", "On-going", "Pending"], onChange: (value) => setSelectedStatus(value as ManagedBookingRow["status"] | "All") }]}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />

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
              {categoriesError ? <p className="rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]" role="alert">{categoriesError}</p> : null}
              <FilterSelect disabled={categoriesLoading || subjectOptions.length === 0} label="What do you want to learn" onSelect={(value) => { setSubject(value); setTutorsPage(1); }} options={subjectOptions} placeholder={categoriesLoading ? "Loading subjects..." : "Select subject"} value={subject} />
              <FilterSelect disabled={categoriesLoading || categoryOptions.length === 0} label="What is the field category?" onSelect={selectCategory} options={categoryOptions} placeholder={categoriesLoading ? "Loading categories..." : "Select category"} value={category} />
              <FilterSelect label="Available days" onSelect={(value) => { setDays(value); setTutorsPage(1); }} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} placeholder="Select a day" value={days} />
              <FilterSelect label="Tutor rating" onSelect={(value) => { setRating(value); setTutorsPage(1); }} options={["3", "4", "4.5"]} placeholder="Select minimum rating" value={rating} />
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

function TutorCardSkeleton() {
  return <div className="animate-pulse rounded-2xl border border-[#e8ecf3] bg-[#f6f8fc] p-4"><div className="rounded-xl border border-[#e8ecf3] bg-white p-4"><div className="flex gap-3"><span className="h-14 w-14 shrink-0 rounded-xl bg-[#e9edf4]" /><div className="flex-1"><span className="block h-3 w-2/5 rounded-full bg-[#e9edf4]" /><span className="mt-2 block h-2.5 w-3/5 rounded-full bg-[#f0f2f6]" /><div className="mt-3 flex gap-2"><span className="h-5 w-20 rounded-md bg-[#f0f2f6]" /><span className="h-5 w-16 rounded-md bg-[#f0f2f6]" /></div><span className="mt-3 block h-2.5 w-1/2 rounded-full bg-[#f0f2f6]" /></div></div></div><div className="mt-3 flex justify-end gap-2"><span className="h-10 w-28 rounded-full bg-[#e9edf4]" /><span className="h-10 w-28 rounded-full bg-[#dddff0]" /></div></div>;
}

function InfiniteTutorScroll({ enabled, onVisible }: { enabled: boolean; onVisible: () => void }) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!enabled || !trigger) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onVisible();
    }, { rootMargin: "180px" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, onVisible]);
  return <div aria-hidden className="col-span-full h-px" ref={triggerRef} />;
}

function FilterSelect({
  disabled = false,
  label,
  placeholder,
  value,
  options,
  onSelect,
}: {
  disabled?: boolean;
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (next: string) => void;
}) {
  return (
    <label className="text-[0.74em] font-semibold text-[#8891a7]">
      <span className="mb-[0.35em] block">{label}</span>
      <SelectMenu ariaLabel={label} buttonClassName="text-[0.78em] md:h-[2.65em]" disabled={disabled} indicatorClassName="!h-[1.15rem] !w-[1.15rem] !rounded-[0.3rem]" onChange={onSelect} options={options.map((option) => ({ label: `${option}${label === "Tutor rating" ? "+ stars" : ""}`, value: option }))} placeholder={placeholder} value={value} />
    </label>
  );
}





