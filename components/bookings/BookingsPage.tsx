 "use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, Compass, EllipsisVertical, LocateFixed, MapPin, Search, Star, X } from "lucide-react";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import ResponsiveSheet from "../ui/ResponsiveSheet";
import { DataTableShell } from "../ui/DataTableShell";
import { SelectMenu } from "../ui/SelectMenu";
import { getBookings, type BookingListItem, type BookingStatus } from "./bookingApi";
import {
  getCategories,
  getTutors,
  isLocationRequiredError,
  isServiceUnavailableError,
  updateCurrentLocation,
  type StudentCategory,
  type TutorApiItem,
} from "./exploreApi";

type TutorCard = {
  publicId: string;
  name: string;
  title: string;
  rating: string;
  ratingCount: number;
  location?: string;
  distance?: string;
  subjects: string[];
  profilePhoto: string;
  initials: string;
};

type BookingView = "explore" | "manage";

function bookingStatusLabel(status: BookingStatus) {
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function bookingStatusColor(status: BookingStatus) {
  if (status === "completed") return "bg-[#36a269]";
  if (status === "ongoing") return "bg-[#9a5cff]";
  if (status === "cancelled") return "bg-[#d35b5b]";
  return "bg-[#e7c754]";
}

function mapTutor(item: TutorApiItem): TutorCard {
  const name = item.name.trim();
  const nameParts = name.split(/\s+/).filter(Boolean);
  const titleParts = [item.occupation.trim(), item.qualifications.join(", ")].filter(Boolean);
  return {
    publicId: item.public_id.trim(),
    name,
    title: titleParts.join(" - "),
    rating: item.average_rating.toFixed(1),
    ratingCount: item.rating_count,
    location: item.address?.trim() || undefined,
    distance: typeof item.distance_km === "number" ? `${item.distance_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km` : undefined,
    subjects: item.subjects.map((entry) => entry.subject),
    profilePhoto: item.profile_photo.trim(),
    initials: nameParts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join(""),
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
  const [tutorsUnavailable, setTutorsUnavailable] = useState(false);
  const [locationRequired, setLocationRequired] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [tutorsPage, setTutorsPage] = useState(1);
  const [tutorsTotalPages, setTutorsTotalPages] = useState(0);
  const [tutorsRefreshKey, setTutorsRefreshKey] = useState(0);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<StudentCategory[]>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoriesUnavailable, setCategoriesUnavailable] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [days, setDays] = useState("");
  const [rating, setRating] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftDays, setDraftDays] = useState("");
  const [draftRating, setDraftRating] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "">("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = tutorQuery.trim();
      if (nextQuery) {
        setSubject("");
        setCategory("");
        setDays("");
        setRating("");
      }
      setTutorsPage(1);
      setDebouncedTutorQuery(nextQuery);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [tutorQuery]);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        setCategories(await getCategories(controller.signal));
        setCategoriesUnavailable(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setCategories([]);
        if (isServiceUnavailableError(error)) {
          setCategoriesUnavailable(true);
          setCategoriesError("");
        } else {
          setCategoriesError(error instanceof Error ? error.message : "Could not load learning categories.");
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, [tutorsRefreshKey]);

  useEffect(() => {
    if (view !== "explore") return;
    const controller = new AbortController();
    const loadTutors = async () => {
      setTutorsLoading(true);
      setTutorsError("");
      setLocationRequired(false);
      try {
        const tutorPage = await getTutors(
          {
            page: tutorsPage,
            pageSize: 20,
            name: debouncedTutorQuery || undefined,
            department: category || undefined,
            subject: subject || undefined,
            day: days || undefined,
            minimumRating: rating || undefined,
          },
          controller.signal,
        );
        const nextTutors = tutorPage.data.map(mapTutor);
        setTutorCards((current) => {
          if (tutorsPage === 1) return nextTutors;
          const combined = [...current, ...nextTutors];
          return combined.filter((tutor, index) => combined.findIndex((candidate) => candidate.publicId ? candidate.publicId === tutor.publicId : candidate.name === tutor.name) === index);
        });
        setTutorsTotalPages(tutorPage.total_pages);
        setTutorsUnavailable(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (tutorsPage === 1) setTutorCards([]);
        if (isServiceUnavailableError(error)) {
          setTutorsUnavailable(true);
          setTutorsError("");
        } else if (isLocationRequiredError(error)) {
          setLocationRequired(true);
          setTutorsError("");
        } else {
          setTutorsError(error instanceof Error ? error.message : "Could not load tutors.");
        }
      } finally {
        if (!controller.signal.aborted) setTutorsLoading(false);
      }
    };
    void loadTutors();
    return () => controller.abort();
  }, [category, days, debouncedTutorQuery, rating, subject, tutorsPage, tutorsRefreshKey, view]);

  useEffect(() => {
    if (view !== "manage") return;
    const controller = new AbortController();
    const load = async () => {
      setBookingsLoading(true);
      setBookingsError("");
      try {
        const result = await getBookings({ date: bookingDate || undefined, page: bookingsPage, pageSize: 20, status: selectedStatus || undefined }, controller.signal);
        setBookings(result.data);
        setBookingsTotalPages(result.total_pages);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBookings([]);
        setBookingsError(error instanceof Error ? error.message : "Could not load bookings.");
      } finally {
        if (!controller.signal.aborted) setBookingsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [bookingDate, bookingsPage, bookingsRefreshKey, selectedStatus, view]);

  const categoryOptions = useMemo(() => categories.map((item) => item.department).filter(Boolean), [categories]);
  const serviceUnavailable = categoriesUnavailable || tutorsUnavailable;
  const selectedCategory = useMemo(() => categories.find((item) => item.department === category), [categories, category]);
  const subjectOptions = useMemo(() => {
    const source = selectedCategory ? selectedCategory.subjects : categories.flatMap((item) => item.subjects);
    return [...new Set(source.map((item) => item.subject).filter(Boolean))].sort((first, second) => first.localeCompare(second));
  }, [categories, selectedCategory]);
  const draftSelectedCategory = useMemo(
    () => categories.find((item) => item.department === draftCategory),
    [categories, draftCategory],
  );
  const draftSubjectOptions = useMemo(() => {
    const source = draftSelectedCategory
      ? draftSelectedCategory.subjects
      : categories.flatMap((item) => item.subjects);
    return [...new Set(source.map((item) => item.subject))].sort((first, second) => first.localeCompare(second));
  }, [categories, draftSelectedCategory]);
  const activeFilterCount = useMemo(
    () => [subject, category, days, rating].filter(Boolean).length,
    [subject, category, days, rating]
  );
  const clearSearch = () => {
    setTutorQuery("");
    setDebouncedTutorQuery("");
  };

  const handleTutorQueryChange = (value: string) => {
    setTutorQuery(value);
  };

  const selectSubject = (nextSubject: string) => {
    clearSearch();
    setSubject(nextSubject);
    setTutorsPage(1);
  };

  const selectDays = (nextDays: string) => {
    clearSearch();
    setDays(nextDays);
    setTutorsPage(1);
  };

  const selectRating = (nextRating: string) => {
    clearSearch();
    setRating(nextRating);
    setTutorsPage(1);
  };

  const selectCategory = (nextCategory: string) => {
    clearSearch();
    setCategory(nextCategory);
    setTutorsPage(1);
    const nextSubjects = categories.find((item) => item.department === nextCategory)?.subjects.map((item) => item.subject) ?? [];
    if (subject && nextCategory && !nextSubjects.includes(subject)) setSubject("");
  };

  const openFilterSheet = () => {
    setDraftSubject(subject);
    setDraftCategory(category);
    setDraftDays(days);
    setDraftRating(rating);
    setIsFilterOpen(true);
  };

  const selectDraftCategory = (nextCategory: string) => {
    setDraftCategory(nextCategory);
    const nextSubjects = categories.find((item) => item.department === nextCategory)?.subjects.map((item) => item.subject) ?? [];
    if (draftSubject && nextCategory && !nextSubjects.includes(draftSubject)) setDraftSubject("");
  };

  const resetDraftFilters = () => {
    setDraftSubject("");
    setDraftCategory("");
    setDraftDays("");
    setDraftRating("");
  };

  const applyMobileFilters = () => {
    clearSearch();
    setSubject(draftSubject);
    setCategory(draftCategory);
    setDays(draftDays);
    setRating(draftRating);
    setTutorsPage(1);
    setIsFilterOpen(false);
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
            onClick={openFilterSheet}
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
            <FilterSelect disabled={categoriesLoading || subjectOptions.length === 0} label="What do you want to learn" onSelect={selectSubject} options={subjectOptions} placeholder={categoriesLoading ? "Loading subjects..." : "Select subject"} value={subject} />
            <FilterSelect disabled={categoriesLoading || categoryOptions.length === 0} label="What is the field category?" onSelect={selectCategory} options={categoryOptions} placeholder={categoriesLoading ? "Loading categories..." : "Select category"} value={category} />
            <FilterSelect label="Available days" onSelect={selectDays} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} placeholder="Select a day" value={days} />
            <FilterSelect label="Tutor rating" onSelect={selectRating} options={["3", "4", "4.5"]} placeholder="Select minimum rating" value={rating} />
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
                onChange={(event) => handleTutorQueryChange(event.target.value)}
                value={tutorQuery}
              />
            </div>
          </div>
          </div>
        ) : null}

        {view === "explore" ? (
            <div className="grid gap-[1.1em] xl:grid-cols-2 2xl:grid-cols-3">
          {serviceUnavailable ? <div className="col-span-full flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#e2e6ef] bg-[#f8f9fc] px-5 py-5 sm:flex-row sm:items-center" role="alert"><p className="text-sm font-medium text-[#626b80]">We couldn&apos;t load this right now.</p><button className="min-h-10 rounded-full bg-[#232066] px-5 text-sm font-semibold text-white" onClick={() => { setCategoriesUnavailable(false); setTutorsUnavailable(false); setTutorsRefreshKey((current) => current + 1); }} type="button">Try again</button></div> : null}
          {locationRequired ? <div className="col-span-full flex flex-col items-start gap-4 rounded-2xl border border-[#dfe3f5] bg-[linear-gradient(135deg,#f8f9ff_0%,#f1f3ff_100%)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between" role="status"><div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#514bc8] shadow-sm"><LocateFixed className="h-5 w-5" /></span><div><h3 className="text-sm font-semibold text-[#30375a]">Set your location to find tutors near you</h3><p className="mt-1 max-w-xl text-xs leading-relaxed text-[#757e96]">We use your location to calculate tutor distance and show relevant results. Your browser will ask for permission before anything is saved.</p></div></div><button className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#232066] px-5 text-sm font-semibold text-white hover:bg-[#1c175f] sm:w-auto" onClick={() => setLocationModalOpen(true)} type="button"><MapPin className="h-4 w-4" />Get location</button></div> : null}
          {tutorsError ? <div className="col-span-full flex items-center justify-between gap-3 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3 text-sm font-medium text-[#8b5a20]" role="alert"><span>{tutorsError}</span><button className="shrink-0 font-semibold underline" onClick={() => setTutorsRefreshKey((current) => current + 1)} type="button">Try again</button></div> : null}
          {tutorsLoading && !locationRequired && !serviceUnavailable && tutorCards.length === 0 ? Array.from({ length: 4 }, (_, index) => <TutorCardSkeleton key={`tutor-skeleton-${index}`} />) : null}
          {tutorCards.map((tutor) => (
            <article
              key={tutor.publicId}
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
                        {tutor.title ? <p className="text-[0.7em] text-[#8a92a6]">{tutor.title}</p> : null}

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

                        {tutor.location || tutor.distance ? <div className="mt-[0.45em] flex flex-wrap items-center gap-[0.4em] text-[0.7em] text-[#7b8197]">
                          {tutor.location ? <span className="inline-flex items-center gap-1">
                            <MapPin className="h-[0.95em] w-[0.95em] text-[#6f6dd5]" />
                            {tutor.location}
                          </span> : null}
                          {tutor.location && tutor.distance ? <span className="text-[#a0a7b8]">-</span> : null}
                          {tutor.distance ? <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-[#4f566b]">{tutor.distance}</span>
                            <span>from you</span>
                          </span> : null}
                        </div> : null}
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
          {!tutorsLoading && !tutorsError && !serviceUnavailable && tutorCards.length === 0 ? <p className="col-span-full rounded-2xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-4 py-10 text-center text-sm text-[#747d92]">{debouncedTutorQuery ? "No tutors match that name." : "No tutors match the selected filters."}</p> : null}
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

            <div className="grid gap-3 rounded-xl border border-[#e5e9f2] bg-[#f8f9fc] p-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-[#657087]">Status<SelectMenu ariaLabel="Booking status" className="mt-1.5" onChange={(value) => { setSelectedStatus(value as BookingStatus | ""); setBookingsPage(1); }} options={[{ label: "All statuses", value: "" }, { label: "Pending", value: "pending" }, { label: "Awaiting approval", value: "awaiting_approval" }, { label: "Ongoing", value: "ongoing" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]} placeholder="All statuses" value={selectedStatus} /></label>
              <label className="text-xs font-semibold text-[#657087]">Booking date<input className="mt-1.5 h-11 w-full rounded-xl border border-[#dce1eb] bg-white px-3 text-sm text-[#4a5265] outline-none focus:border-[#5f64d8]" onChange={(event) => { setBookingDate(event.target.value); setBookingsPage(1); }} type="date" value={bookingDate} /></label>
            </div>

            {bookingsError ? <div className="flex items-center justify-between gap-3 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3 text-sm font-medium text-[#8b5a20]" role="alert"><span>{bookingsError}</span><button className="shrink-0 underline" onClick={() => setBookingsRefreshKey((current) => current + 1)} type="button">Try again</button></div> : null}
            {bookingsLoading ? <p className="py-4 text-center text-sm text-[#7a8299]" role="status">Loading bookings...</p> : null}

            {!bookingsLoading && bookings.length ? <DataTableShell>
                <table className="w-full min-w-[920px] border-collapse text-left text-[0.74em] text-[#5f667b]">
                  <thead className="bg-[#f2f5fa] text-[#676f85]">
                    <tr>
                      {["Date", "Tutor", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => (
                        <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((row) => (
                      <tr
                        key={row.public_id}
                        className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]"
                        onClick={() => router.push(`/students/bookings/manage/${encodeURIComponent(row.public_id)}?status=${row.status}`)}
                      >
                        <td className="px-3 py-2.5">{row.date}</td>
                        <td className="px-3 py-2.5">{row.tutor_name}</td>
                        <td className="px-3 py-2.5">{row.department}</td>
                        <td className="px-3 py-2.5">{row.subject}</td>
                        <td className="px-3 py-2.5">{row.time}</td>
                        <td className="px-3 py-2.5">{row.duration}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${bookingStatusColor(row.status)}`} />
                            {bookingStatusLabel(row.status)}
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
                    ))}
                  </tbody>
                </table>
            </DataTableShell> : null}

            {!bookingsLoading && bookings.length ? <div className="space-y-1.5 pb-6 md:hidden">
              {bookings.map((row) => (
                <Link
                  key={row.public_id}
                  className="block rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2"
                  href={`/students/bookings/manage/${encodeURIComponent(row.public_id)}?status=${row.status}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[0.78em] font-semibold text-[#2f3547]">{row.tutor_name}</p>
                      <p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">{row.subject} - {row.time}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[0.66em] text-[#5f667b]">
                        <span className={`h-1.5 w-1.5 rounded-full ${bookingStatusColor(row.status)}`} />
                        {bookingStatusLabel(row.status)}
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
              ))}
            </div> : null}
            {!bookingsLoading && !bookingsError && bookings.length === 0 ? <p className="rounded-xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-4 py-10 text-center text-sm text-[#747d92]">No bookings match these filters.</p> : null}
            {bookingsTotalPages > 1 ? <div className="flex items-center justify-center gap-3 pb-6"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#596177] disabled:opacity-40" disabled={bookingsLoading || bookingsPage <= 1} onClick={() => setBookingsPage((current) => current - 1)} type="button">Previous</button><span className="text-xs font-medium text-[#7a8299]">Page {bookingsPage} of {bookingsTotalPages}</span><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#596177] disabled:opacity-40" disabled={bookingsLoading || bookingsPage >= bookingsTotalPages} onClick={() => setBookingsPage((current) => current + 1)} type="button">Next</button></div> : null}
          </section>
        )}
        </section>
      </DashboardShell>

      <ResponsiveSheet mobileOnly open={view === "explore" && isFilterOpen} onClose={() => setIsFilterOpen(false)}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#d8dde8]" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.95em] font-semibold text-[#3f4670]">Filter tutors</h3>
              <button className="text-[0.75em] font-semibold text-[#7c8498]" onClick={resetDraftFilters} type="button">Reset</button>
            </div>
            <div className="grid gap-3 overflow-y-auto pb-3">
              {categoriesError ? <p className="rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]" role="alert">{categoriesError}</p> : null}
              <FilterSelect disabled={categoriesLoading || draftSubjectOptions.length === 0} label="What do you want to learn" onSelect={setDraftSubject} options={draftSubjectOptions} placeholder={categoriesLoading ? "Loading subjects..." : "Select subject"} value={draftSubject} />
              <FilterSelect disabled={categoriesLoading || categoryOptions.length === 0} label="What is the field category?" onSelect={selectDraftCategory} options={categoryOptions} placeholder={categoriesLoading ? "Loading categories..." : "Select category"} value={draftCategory} />
              <FilterSelect label="Available days" onSelect={setDraftDays} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]} placeholder="Select a day" value={draftDays} />
              <FilterSelect label="Tutor rating" onSelect={setDraftRating} options={["3", "4", "4.5"]} placeholder="Select minimum rating" value={draftRating} />
            </div>
            <div className="mt-auto flex gap-2 border-t border-[#eef1f6] bg-white py-3">
              <button className="h-11 flex-1 rounded-full bg-[#ececef] text-[0.82em] font-semibold text-[#4e576d]" onClick={() => setIsFilterOpen(false)} type="button">
                Cancel
              </button>
              <button className="h-11 flex-1 rounded-full bg-[#232066] text-[0.82em] font-semibold text-white" onClick={applyMobileFilters} type="button">
                Apply
              </button>
            </div>
      </ResponsiveSheet>
      {locationModalOpen ? <LocationRequiredModal onClose={() => setLocationModalOpen(false)} onSaved={() => { setLocationModalOpen(false); setLocationRequired(false); setTutorsPage(1); setTutorsRefreshKey((current) => current + 1); }} /> : null}
    </>
  );
}

function LocationRequiredModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError("Location access is not supported by this browser.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        });
      });
      if (!Number.isFinite(position.coords.accuracy) || position.coords.accuracy > 50) {
        throw new Error("We could not get a precise location. Please move somewhere with a clearer GPS signal and try again.");
      }
      await updateCurrentLocation({
        accuracy: position.coords.accuracy,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      onSaved();
    } catch (caught) {
      if (caught && typeof caught === "object" && !(caught instanceof Error) && "code" in caught) {
        const geolocationError = caught as GeolocationPositionError;
        setError(geolocationError.code === geolocationError.PERMISSION_DENIED
          ? "Location permission was denied. Allow location access in your browser and try again."
          : "We could not get your location. Please try again.");
      } else {
        setError(caught instanceof Error ? caught.message : "Could not save your location.");
      }
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#11152f]/50 px-4 py-6 backdrop-blur-[2px]" onClick={saving ? undefined : onClose}><section aria-labelledby="location-required-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-[#e2e5f0] bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()} role="dialog"><div className="flex items-start justify-between gap-4"><span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eff1ff] text-[#4c47c6]"><LocateFixed className="h-6 w-6" /></span><button aria-label="Close location prompt" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#747d91] hover:bg-[#f3f4f8] disabled:opacity-50" disabled={saving} onClick={onClose} type="button"><X className="h-4 w-4" /></button></div><h2 className="mt-4 text-xl font-semibold text-[#293047]" id="location-required-title">Find tutors near you</h2><p className="mt-2 text-sm leading-relaxed text-[#747d91]">Allow SP Novate to get your current location. Only precise locations within the backend&apos;s accepted accuracy will be saved.</p>{error ? <p className="mt-4 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2.5 text-sm font-medium text-[#8b5a20]" role="alert">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className="min-h-11 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#596177] disabled:opacity-50" disabled={saving} onClick={onClose} type="button">Not now</button><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#232066] px-5 text-sm font-semibold text-white hover:bg-[#1c175f] disabled:cursor-wait disabled:opacity-70" disabled={saving} onClick={() => void getLocation()} type="button"><MapPin className="h-4 w-4" />{saving ? "Getting location..." : "Get location"}</button></div></section></div>;
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





