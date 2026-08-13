"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, EllipsisVertical } from "lucide-react";

import { DashboardShell } from "../layout/DashboardShell";
import { DataToolbar } from "../ui/DataToolbar";
import { DataTableShell } from "../ui/DataTableShell";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
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

const statusTone: Record<BookingStatus, StatusTone> = {
  Completed: "success",
  Pending: "warning",
  "Awaiting approval": "info",
  Rejected: "danger",
};

export default function TutorBookingsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "All">("All");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [openActionIndex, setOpenActionIndex] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

  const openDetails = (bookingIndex: number) => {
    router.push(`/tutor/bookings/manage/${bookingIndex + 1}`);
    setOpenActionIndex(null);
  };

  const formatRangeLabel = dateFrom || dateTo
    ? `${dateFrom ? dateFrom.replaceAll("-", "/") : "..."} - ${dateTo ? dateTo.replaceAll("-", "/") : "..."}`
    : "All dates";

  return (
    <DashboardShell navbar={<TutorNavbar active="Bookings" />}>
      <section className="w-full py-4 md:py-5">
              <h1 className="text-xl font-semibold tracking-[-0.01em] text-ui-title sm:text-2xl">Booking requests</h1>

              <div className="mt-5 sm:mt-6"><DataToolbar placeholder="Search student name or booking ID" /></div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-b border-[#e7ebf4] pb-3 md:gap-2.5">
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
                    <div className="absolute left-0 top-[calc(100%+0.4rem)] z-30 w-[13.5rem] rounded-lg border border-[#dfe4ef] bg-white p-2.5 shadow-[0_10px_24px_rgba(32,41,78,0.14)]">
                      <p className="mb-1.5 text-[0.72rem] font-semibold text-[#55607a]">Pick date range</p>
                      <label className="mb-1.5 block text-[0.66rem] font-semibold text-[#7a8299]">
                        From
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#d8deea] px-2 text-[0.72rem] md:h-10"
                          onChange={(event) => {
                            setDateFrom(event.target.value);
                          }}
                          type="date"
                          value={dateFrom}
                        />
                      </label>
                      <label className="block text-[0.66rem] font-semibold text-[#7a8299]">
                        To
                        <input
                          className="mt-1 h-11 w-full rounded-md border border-[#d8deea] px-2 text-[0.72rem] md:h-10"
                          onChange={(event) => {
                            setDateTo(event.target.value);
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
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[13rem] rounded-xl border border-[#dfe4ef] bg-white p-2 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[15rem] 2xl:p-2.5">
                      {(["All", "Completed", "Pending", "Awaiting approval", "Rejected"] as const).map((status) => (
                        <button
                          key={status}
                          className={`flex min-h-11 w-full items-center justify-between rounded-md px-2 py-1.5 text-[0.78rem] md:min-h-9 2xl:px-2.5 2xl:py-2 2xl:text-[0.92rem] ${
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

              <DataTableShell className="mt-3">
                  <table className="w-full min-w-[920px] border-collapse text-left text-[0.74em] text-[#5f667b]">
                    <thead className="bg-[#f2f5fa] text-[#676f85]">
                      <tr>
                        {["Date", "Students", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, index) => {
                        const originalIndex = bookingRequests.indexOf(row);
                        const rowIndex = originalIndex >= 0 ? originalIndex : index;
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
                              <StatusIndicator label={row.status} tone={statusTone[row.status]} />
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
              </DataTableShell>

              <div className="mt-3 space-y-1.5 pb-6 md:hidden">
                {filteredRows.map((row, index) => {
                  const originalIndex = bookingRequests.indexOf(row);
                  const rowIndex = originalIndex >= 0 ? originalIndex : index;
                  return (
                  <button className="w-full rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2 text-left" key={`${row.student}-mobile-${index}`} onClick={() => openDetails(rowIndex)} type="button">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[0.78em] font-semibold text-[#2f3547]">{row.student}</p>
                        <p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">{row.subject} - {row.time}</p>
                      </div>
                      <EllipsisVertical className="h-3.5 w-3.5 shrink-0 text-[#7b8296]" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[0.66em] text-[#596177]">{row.date}</span>
                      <StatusIndicator className="text-[0.66em]" label={row.status} tone={statusTone[row.status]} />
                    </div>
                  </button>
                  );
                })}
              </div>
      </section>
    </DashboardShell>
  );
}
