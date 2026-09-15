"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EllipsisVertical } from "lucide-react";

import { DashboardShell } from "../layout/DashboardShell";
import { DataTableShell } from "../ui/DataTableShell";
import { InfiniteScrollTrigger } from "../ui/InfiniteScrollTrigger";
import { TableFilters } from "../ui/TableFilters";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
import { TutorNavbar } from "./TutorNavbar";
import { getTutorBookings, type TutorBooking, type TutorBookingStatus } from "./tutorBookings";

const PAGE_SIZE = 20;
const statusLabels: Record<TutorBookingStatus, string> = {
  pending: "Pending",
  awaiting_approval: "Awaiting approval",
  ongoing: "Ongoing",
  completed: "Completed",
  rejected: "Rejected",
};
const statusValues = Object.entries(statusLabels) as Array<[TutorBookingStatus, string]>;

function statusTone(status: TutorBookingStatus): StatusTone {
  if (status === "completed") return "success";
  if (status === "pending") return "warning";
  if (status === "awaiting_approval" || status === "ongoing") return "info";
  return "danger";
}

export default function TutorBookingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<TutorBooking[]>([]);
  const [status, setStatus] = useState<TutorBookingStatus | "">("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getTutorBookings({ date: date || undefined, page, pageSize: PAGE_SIZE, status: status || undefined }, controller.signal)
      .then((result) => {
        setRows((current) => page === 1 ? result.data : [...current, ...result.data]);
        setTotal(result.total);
        setTotalPages(Math.max(result.total_pages, 1));
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Booking requests could not be loaded.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, page, status]);

  const selectedStatusLabel = status ? statusLabels[status] : "All";
  const changeStatus = (label: string) => {
    setLoading(true);
    setError("");
    setStatus(statusValues.find(([, value]) => value === label)?.[0] ?? "");
    setPage(1);
  };
  const openDetails = (bookingId: string) => router.push(`/tutor/bookings/manage/${encodeURIComponent(bookingId)}`);

  return (
    <DashboardShell navbar={<TutorNavbar active="Bookings" />}>
      <section className="w-full py-4 md:py-5">
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-ui-title sm:text-2xl">Booking requests</h1>
        <TableFilters className="mt-5 sm:mt-6" date={date} filters={[{ label: "Status", value: selectedStatusLabel, options: ["All", ...statusValues.map(([, label]) => label)], onChange: changeStatus }]} onDateChange={(value) => { setLoading(true); setError(""); setDate(value); setPage(1); }} />
        {error ? <p className="mt-3 rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3 py-2 text-sm text-brand-danger" role="alert">{error}</p> : null}

        <DataTableShell className="mt-3">
          <table className="w-full min-w-[920px] border-collapse text-left text-[0.74em] text-[#5f667b]">
            <thead className="bg-[#f2f5fa] text-[#676f85]"><tr>{["Date", "Students", "Department", "Subject", "Time", "Duration", "Status", ""].map((head) => <th className="px-3 py-2.5 font-semibold" key={head}>{head}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => <tr className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]" key={row.public_id} onClick={() => openDetails(row.public_id)}><td className="px-3 py-2.5">{row.date}</td><td className="px-3 py-2.5">{row.student_name}</td><td className="px-3 py-2.5">{row.department}</td><td className="px-3 py-2.5">{row.subject}</td><td className="px-3 py-2.5">{row.time}</td><td className="px-3 py-2.5">{row.duration}</td><td className="px-3 py-2.5"><StatusIndicator label={statusLabels[row.status]} tone={statusTone(row.status)} /></td><td className="relative px-3 py-2.5 text-right"><button aria-label={`Actions for ${row.student_name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6f768c] hover:bg-[#f1f4fa]" onClick={(event) => { event.stopPropagation(); setOpenActionId((current) => current === row.public_id ? null : row.public_id); }} type="button"><EllipsisVertical className="h-3.5 w-3.5" /></button>{openActionId === row.public_id ? <div className="absolute right-5 top-[calc(100%-0.1rem)] z-30 w-48 rounded-lg border border-[#e2e7f2] bg-white py-2 text-left shadow-[0_12px_30px_rgba(32,41,78,0.14)]"><button className="block w-full px-3 py-2 text-xs text-[#5f667b] hover:bg-[#f8faff]" onClick={(event) => { event.stopPropagation(); openDetails(row.public_id); }} type="button">View booking details</button></div> : null}</td></tr>)}
              {!loading && rows.length === 0 ? <tr><td className="px-4 py-10 text-center text-sm text-[#7a8297]" colSpan={8}>No booking requests found.</td></tr> : null}
              {loading && page === 1 ? <tr><td className="px-4 py-10 text-center text-sm text-[#7a8297]" colSpan={8}>Loading booking requests...</td></tr> : null}
            </tbody>
          </table>
        </DataTableShell>

        <div className="mt-3 space-y-1.5 md:hidden">{rows.map((row) => <button className="w-full rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2 text-left" key={`${row.public_id}-mobile`} onClick={() => openDetails(row.public_id)} type="button"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[0.78em] font-semibold text-[#2f3547]">{row.student_name}</p><p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">{row.subject} - {row.time}</p></div><EllipsisVertical className="h-3.5 w-3.5 shrink-0 text-[#7b8296]" /></div><div className="mt-1.5 flex items-center justify-between"><span className="text-[0.66em] text-[#596177]">{row.date}</span><StatusIndicator className="text-[0.66em]" label={statusLabels[row.status]} tone={statusTone(row.status)} /></div></button>)}</div>
        <p className="mt-3 text-xs text-ui-body">{total.toLocaleString()} booking{total === 1 ? "" : "s"}</p>
        {loading && page > 1 ? <p className="py-3 text-center text-xs text-[#8a93a7]" role="status">Loading more bookings...</p> : null}
        <InfiniteScrollTrigger enabled={!loading && page < totalPages} onVisible={() => { setLoading(true); setError(""); setPage((current) => current + 1); }} />
      </section>
    </DashboardShell>
  );
}
