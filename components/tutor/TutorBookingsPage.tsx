"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, EllipsisVertical, Search, SlidersHorizontal } from "lucide-react";

import { TutorNavbar } from "./TutorNavbar";

type BookingStatus = "Completed" | "Pending" | "Awaiting approval" | "Rejected";

type BookingRequest = {
  date: string;
  student: string;
  department: string;
  subject: string;
  time: string;
  duration: string;
  status: BookingStatus;
};

const bookingRequests: BookingRequest[] = [
  { date: "March 15, 2026", student: "Ekene Ezegbunam", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Akin-akintaylor Akinbowale", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Quadri Ahmed", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 15, 2026", student: "Regina Akpan", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Awaiting approval" },
  { date: "March 15, 2026", student: "David Lawal", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Awaiting approval" },
  { date: "March 15, 2026", student: "Elizabeth Obi", department: "Academics", subject: "Entrance Exam", time: "4:00 PM", duration: "1 Hour", status: "Rejected" },
  { date: "March 15, 2026", student: "Doris Irabor", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Catherine Isime", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Abolarinde Cole", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Pending" },
  { date: "March 15, 2026", student: "Edward Samuel", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Mr. Oluyinka Alabi", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
  { date: "March 15, 2026", student: "Mr. Oluyinka Alabi", department: "Academics", subject: "Entrance Exams", time: "4:00 PM", duration: "1 Hour", status: "Completed" },
];

const statusColor: Record<BookingStatus, string> = {
  Completed: "bg-[#14b861]",
  Pending: "bg-[#e8bc3d]",
  "Awaiting approval": "bg-[#1c8ddd]",
  Rejected: "bg-[#e04f4f]",
};

export default function TutorBookingsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "All">("All");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [openActionIndex, setOpenActionIndex] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const desktopTableViewportRef = useRef<HTMLDivElement | null>(null);
  const desktopTableRef = useRef<HTMLTableElement | null>(null);

  useEffect(() => {
    const computeRowsPerPage = () => {
      const viewport = desktopTableViewportRef.current;
      const table = desktopTableRef.current;
      if (!viewport || !table) return;

      const headHeight = table.tHead?.getBoundingClientRect().height ?? 40;
      const firstRow = table.tBodies[0]?.rows[0];
      const rowHeight = firstRow?.getBoundingClientRect().height ?? 40;
      const availableHeight = viewport.clientHeight - headHeight;
      const nextRowsPerPage = Math.max(1, Math.floor(availableHeight / Math.max(rowHeight, 1)));

      setRowsPerPage((prev) => (prev === nextRowsPerPage ? prev : nextRowsPerPage));
    };

    computeRowsPerPage();
    const resizeObserver = new ResizeObserver(computeRowsPerPage);
    if (desktopTableViewportRef.current) resizeObserver.observe(desktopTableViewportRef.current);
    if (desktopTableRef.current) resizeObserver.observe(desktopTableRef.current);
    window.addEventListener("resize", computeRowsPerPage);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", computeRowsPerPage);
    };
  }, [dateFrom, dateTo, selectedStatus]);

  const filteredRows = useMemo(() => {
    return bookingRequests.filter((row) => {
      const statusPass = selectedStatus === "All" ? true : row.status === selectedStatus;
      const rowDate = new Date(row.date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      const fromPass = from ? rowDate >= from : true;
      const toPass = to ? rowDate <= to : true;
      const datePass = !Number.isNaN(rowDate.valueOf()) && fromPass && toPass;
      return statusPass && datePass;
    });
  }, [dateFrom, dateTo, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [currentPage, filteredRows, rowsPerPage]);

  const openDetails = (bookingIndex: number) => {
    router.push(`/tutor/bookings/manage/${bookingIndex + 1}`);
    setOpenActionIndex(null);
  };

  const formatRangeLabel = dateFrom || dateTo
    ? `${dateFrom ? dateFrom.replaceAll("-", "/") : "..."} - ${dateTo ? dateTo.replaceAll("-", "/") : "..."}`
    : "All dates";

  return (
    <main className="dashboard-screen bg-white text-[#2b3245]">
      <div className="dashboard-shell">
        <TutorNavbar active="Bookings" />
        <section className="dashboard-main min-h-0 overflow-hidden">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <section className="flex h-full min-h-0 w-full flex-col py-[1.1em]">
              <h1 className="text-[1.35em] font-semibold text-[#1f2550]">Booking requests</h1>

              <div className="mt-6 flex items-center justify-between gap-2">
                <div className="relative w-full max-w-[22rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a1a9bc]" />
                  <input className="h-9 w-full rounded-full border border-[#e1e6f2] bg-white pl-9 pr-3 text-[0.76em] text-[#495167] placeholder:text-[#adb4c5]" placeholder="Search tutor name or booking ID" type="search" />
                </div>
                <button className="inline-flex h-8 items-center gap-1 rounded-md border border-[#e2e7f2] bg-white px-2.5 text-[0.68em] font-semibold text-[#7a8299]" type="button">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-b border-[#e7ebf4] pb-3 md:gap-2.5">
                <div className="relative">
                  <button
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-3 text-[0.68em] font-semibold text-[#747e95]"
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
                    <div className="absolute left-0 top-[calc(100%+0.4rem)] z-30 w-[13.5rem] rounded-lg border border-[#dfe4ef] bg-white p-2.5 shadow-[0_10px_24px_rgba(32,41,78,0.14)]">
                      <p className="mb-1.5 text-[0.72rem] font-semibold text-[#55607a]">Pick date range</p>
                      <label className="mb-1.5 block text-[0.66rem] font-semibold text-[#7a8299]">
                        From
                        <input
                          className="mt-1 h-8 w-full rounded-md border border-[#d8deea] px-2 text-[0.72rem]"
                          onChange={(event) => {
                            setDateFrom(event.target.value);
                            setPage(1);
                          }}
                          type="date"
                          value={dateFrom}
                        />
                      </label>
                      <label className="block text-[0.66rem] font-semibold text-[#7a8299]">
                        To
                        <input
                          className="mt-1 h-8 w-full rounded-md border border-[#d8deea] px-2 text-[0.72rem]"
                          onChange={(event) => {
                            setDateTo(event.target.value);
                            setPage(1);
                          }}
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
                    className="inline-flex h-7 items-center gap-1 rounded-full border border-[#e2e7f2] bg-white px-3 text-[0.68em] font-semibold text-[#747e95]"
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
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[13rem] rounded-xl border border-[#dfe4ef] bg-white p-2 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[15rem] 2xl:p-2.5">
                      {(["All", "Completed", "Pending", "Awaiting approval", "Rejected"] as const).map((status) => (
                        <button
                          key={status}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[0.78rem] 2xl:px-2.5 2xl:py-2 2xl:text-[0.92rem] ${
                            selectedStatus === status ? "bg-[#eef0ff] text-[#2f34aa]" : "text-[#5f667b]"
                          }`}
                          onClick={() => {
                            setSelectedStatus(status);
                            setPage(1);
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

              <div className="mt-3 hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-[#e3e8f2] bg-white md:flex md:flex-col">
                <div className="min-h-0 flex-1 overflow-x-auto" ref={desktopTableViewportRef}>
                  <table className="w-full min-w-[920px] border-collapse text-left text-[0.74em] text-[#5f667b]" ref={desktopTableRef}>
                    <thead className="bg-[#f2f5fa] text-[#676f85]">
                      <tr>
                        {["Date", "Students", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, index) => {
                        const rowIndex = (currentPage - 1) * rowsPerPage + index;
                        return (
                          <tr
                            className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]"
                            key={`${row.student}-${rowIndex}`}
                            onClick={() => openDetails(rowIndex)}
                          >
                            <td className="px-3 py-2.5">{row.date}</td>
                            <td className="px-3 py-2.5">{row.student}</td>
                            <td className="px-3 py-2.5">{row.department}</td>
                            <td className="px-3 py-2.5">{row.subject}</td>
                            <td className="px-3 py-2.5">{row.time}</td>
                            <td className="px-3 py-2.5">{row.duration}</td>
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${statusColor[row.status]}`} />
                                {row.status}
                              </span>
                            </td>
                            <td className="relative px-3 py-2.5 text-right">
                              <button
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#6f768c] hover:bg-[#f1f4fa]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenActionIndex((prev) => (prev === rowIndex ? null : rowIndex));
                                }}
                                type="button"
                              >
                                <EllipsisVertical className="h-3.5 w-3.5" />
                              </button>
                              {openActionIndex === rowIndex ? (
                                <div className="absolute right-5 top-[calc(100%-0.1rem)] z-30 w-[12rem] rounded-lg border border-[#e2e7f2] bg-white py-2 text-left shadow-[0_12px_30px_rgba(32,41,78,0.14)]">
                                  <button className="block w-full px-3 py-2 text-[0.74rem] text-[#5f667b] hover:bg-[#f8faff]" onClick={(event) => { event.stopPropagation(); openDetails(rowIndex); }} type="button">View booking details</button>
                                  <button className="block w-full px-3 py-2 text-[0.74rem] text-[#5f667b] hover:bg-[#f8faff]" onClick={(event) => event.stopPropagation()} type="button">Chat with student</button>
                                  <button className="block w-full px-3 py-2 text-[0.74rem] font-semibold text-[#e53935] hover:bg-[#fff5f5]" onClick={(event) => event.stopPropagation()} type="button">Decline request</button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-[#edf0f6] px-3 py-2.5 text-[0.68em] text-[#6f768c]">
                  <div className="flex items-center gap-1.5">
                    <button className="rounded-md border border-[#e2e7f2] px-2 py-1 text-[#5f667b] disabled:opacity-50" disabled={currentPage === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} type="button">Previous</button>
                    <button className="rounded-md border border-[#e2e7f2] px-2 py-1 text-[#5f667b] disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} type="button">Next</button>
                  </div>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>

              <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto md:hidden">
                {paginatedRows.map((row, index) => {
                  const rowIndex = (currentPage - 1) * rowsPerPage + index;
                  return (
                  <button className="w-full rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2 text-left" key={`${row.student}-mobile-${index}`} onClick={() => openDetails(rowIndex)} type="button">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.84em] font-semibold text-[#2f3547]">{row.student}</p>
                        <p className="mt-0.5 text-[0.7em] text-[#7a8299]">{row.subject} - {row.time}</p>
                      </div>
                      <EllipsisVertical className="h-3.5 w-3.5 text-[#7b8296]" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[0.72em] text-[#596177]">{row.date}</span>
                      <span className="inline-flex items-center gap-1 text-[0.72em] text-[#596177]">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusColor[row.status]}`} />
                        {row.status}
                      </span>
                    </div>
                  </button>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
