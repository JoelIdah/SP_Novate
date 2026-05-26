"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, BanknoteArrowDown, CalendarDays, CheckCircle2, Copy, EllipsisVertical, Landmark, Search, SlidersHorizontal, Wallet } from "lucide-react";

import { DashboardNavbar } from "../dashboard/DashboardNavbar";
import ResponsiveSheet from "../ui/ResponsiveSheet";

type TxStatus = "Successful" | "Pending" | "Failed";

type Transaction = {
  id: string;
  amount: string;
  method: string;
  type: "CR";
  date: string;
  status: TxStatus;
};

const transactions: Transaction[] = [
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
  { id: "B4927183010373", amount: "N16,050.50", method: "Card", type: "CR", date: "March 15, 2026", status: "Failed" },
  { id: "B4927183010373", amount: "N24,760.00", method: "Card", type: "CR", date: "March 15, 2026", status: "Pending" },
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
  { id: "B4927183010373", amount: "N24,760.00", method: "Card", type: "CR", date: "March 15, 2026", status: "Pending" },
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
  { id: "B4927183010373", amount: "N16,050.50", method: "Card", type: "CR", date: "March 15, 2026", status: "Failed" },
  { id: "B4927183010373", amount: "N11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
];

const statusColor: Record<TxStatus, string> = {
  Successful: "bg-[#14b861]",
  Pending: "bg-[#e8bc3d]",
  Failed: "bg-[#e04f4f]",
};

export default function TransactionsPage() {
  const [selectedStatus, setSelectedStatus] = useState<"All" | TxStatus>("All");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
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
    return transactions.filter((row) => {
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
  }, [currentPage, filteredRows]);

  const openDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  const formatRangeLabel = dateFrom || dateTo
    ? `${dateFrom ? dateFrom.replaceAll("-", "/") : "..."} - ${dateTo ? dateTo.replaceAll("-", "/") : "..."}`
    : "All dates";

  return (
    <main className="dashboard-screen bg-white text-[#2b3245]">
      <div className="dashboard-shell">
        <DashboardNavbar active="Transactions" />
        <section className="dashboard-main min-h-0 overflow-hidden">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <section className="flex h-full min-h-0 w-full flex-col py-[1.1em]">
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard icon={<Wallet className="h-4 w-4 text-[#dca95a]" />} label="Total Value" value="N200,000.00" />
                <SummaryCard icon={<CheckCircle2 className="h-4 w-4 text-[#289c7f]" />} label="Successful Transactions" value="10" />
                <SummaryCard icon={<BanknoteArrowDown className="h-4 w-4 text-[#9553da]" />} label="Session Fees" value="N4,000" />
                <SummaryCard icon={<Landmark className="h-4 w-4 text-[#157ac8]" />} label="Finders Fees" value="N500" />
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2">
                <div className="relative w-full max-w-[20rem]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a1a9bc]" />
                  <input className="h-9 w-full rounded-full border border-[#e1e6f2] bg-white pl-9 pr-3 text-[0.76em] text-[#495167] placeholder:text-[#adb4c5]" placeholder="Search transactions" type="search" />
                </div>
                <button className="inline-flex h-8 items-center gap-1 rounded-md border border-[#e2e7f2] bg-white px-2.5 text-[0.68em] font-semibold text-[#7a8299]" type="button">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Sort
                </button>
              </div>

              <div className="mt-2.5 flex items-center gap-2 border-b border-[#e7ebf4] pb-3 md:gap-2.5">
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
                    <CalendarDays className="h-3 w-3" />
                  </button>
                  {isDateMenuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[16.25rem] rounded-xl border border-[#dfe4ef] bg-white p-3 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[19rem] 2xl:p-4">
                      <p className="mb-2 text-[0.78rem] font-semibold text-[#55607a] 2xl:mb-2.5 2xl:text-[0.92rem]">Pick date range</p>
                      <label className="mb-2 block text-[0.72rem] font-semibold text-[#7a8299] 2xl:mb-2.5 2xl:text-[0.84rem]">
                        From
                        <input className="mt-1 h-9 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] 2xl:mt-1.5 2xl:h-10 2xl:text-[0.9rem]" onChange={(e) => setDateFrom(e.target.value)} type="date" value={dateFrom} />
                      </label>
                      <label className="block text-[0.72rem] font-semibold text-[#7a8299] 2xl:text-[0.84rem]">
                        To
                        <input className="mt-1 h-9 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] 2xl:mt-1.5 2xl:h-10 2xl:text-[0.9rem]" onChange={(e) => setDateTo(e.target.value)} type="date" value={dateTo} />
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
                    <span className="text-[0.9em]">+</span>
                  </button>
                  {isStatusMenuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[11.9rem] rounded-xl border border-[#dfe4ef] bg-white p-2 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[13.8rem] 2xl:p-2.5">
                      {(["All", "Successful", "Pending", "Failed"] as const).map((status) => (
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
                        {["Status", "Reference", "Amount", "Method", "Type", "Date Created", ""].map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, idx) => (
                        <tr className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]" key={`${row.id}-${idx}`} onClick={() => openDetails(row)}>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${statusColor[row.status]}`} />
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2">
                              {row.id}
                              <Copy className="h-3 w-3 text-[#4b69d2]" />
                            </span>
                          </td>
                          <td className="px-3 py-2.5">{row.amount}</td>
                          <td className="px-3 py-2.5">{row.method}</td>
                          <td className="px-3 py-2.5">{row.type}</td>
                          <td className="px-3 py-2.5">{row.date}</td>
                          <td className="px-3 py-2.5 text-right"><EllipsisVertical className="ml-auto h-3.5 w-3.5 text-[#6f768c]" /></td>
                        </tr>
                      ))}
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
                {filteredRows.map((row, idx) => (
                  <button className="w-full rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2 text-left" key={`${row.id}-mobile-${idx}`} onClick={() => openDetails(row)} type="button">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-[0.8em] font-semibold text-[#2f3547]">
                          {row.id}
                          <Copy className="h-3 w-3 text-[#4b69d2]" />
                        </div>
                        <p className="mt-0.5 text-[0.7em] text-[#7a8299]">{row.method}</p>
                      </div>
                      <EllipsisVertical className="h-3.5 w-3.5 text-[#7b8296]" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[0.72em] text-[#596177]">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusColor[row.status]}`} />
                        {row.status}
                      </span>
                      <span className="text-[0.72em] font-semibold text-[#4a5166]">{row.amount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      <ResponsiveSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        panelClassName="max-h-[100dvh] rounded-none border-0 px-0 pt-0 pb-[calc(env(safe-area-inset-bottom)+12px)] md:max-h-[92dvh] md:rounded-t-2xl md:border-t md:px-4 md:pt-3 xl:max-w-[560px] xl:rounded-l-xl xl:rounded-tr-none xl:border-l xl:px-5 xl:pt-5"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-[#eceff5] px-4 py-3 xl:px-1 xl:py-0 xl:pb-4">
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#5a647e] xl:hidden" onClick={() => setDetailsOpen(false)} type="button">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-[0.94em] font-semibold text-[#2f3547]">Transaction details</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 xl:px-1 xl:py-0">
            <DetailsBlock title="Cost estimate">
              <DetailRow label="Tutor's fee" value="N3,500" />
              <DetailRow label="Weekly rate" value="N7,000" subLabel="Based on 2 sessions per week and 1 hour per session" />
              <DetailRow label="Finder's fee" value="N2,760.00   N500" />
              <DetailRow label="VAT (7.5%)" value="N37.50" />
              <DetailRow label="Subtotal" value={selectedTx?.amount ?? "N11,037.50"} />
              <DetailRow label="Applicable taxes" value="N0.00" />
              <div className="mt-2 flex items-center justify-between border-t border-[#e7ebf4] pt-2.5 text-[0.84em] font-semibold text-[#2f3547]">
                <span>Total cost</span>
                <span>{selectedTx?.amount ?? "N11,037.50"}</span>
              </div>
            </DetailsBlock>

            <DetailsBlock title="Booking summary">
              <DetailRow label="Department type" value="Common entrance exams" />
              <DetailRow label="Subject type" value="Entrance Exams" />
              <DetailRow label="Session" value="Online" />
              <DetailRow label="Period" value="Evening" />
              <DetailRow label="Number of weeks" value="2 weeks" />
              <DetailRow label="Hours per day" value="1 hour" />
              <DetailRow label="Payment option" value="Full payment" />
              <DetailRow label="Availability" value="Mondays" />
              <DetailRow label="Tutor's fee" value="N3,500" />
            </DetailsBlock>
          </div>

          <div className="border-t border-[#eceff5] px-4 py-3 xl:px-1">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <button className="h-10 rounded-full bg-[#e5e7eb] px-6 text-[0.78em] font-semibold text-[#4f576d]" onClick={() => setDetailsOpen(false)} type="button">
                Close
              </button>
              <button className="h-10 rounded-full bg-[#262563] px-6 text-[0.78em] font-semibold text-white" type="button">
                Share details
              </button>
            </div>
          </div>
        </div>
      </ResponsiveSheet>
    </main>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <article className="rounded-lg border border-[#e2e7f2] bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[0.62em] font-medium text-[#838ca3]">{label}</p>
          <p className="mt-[0.1em] text-[0.95em] font-semibold text-[#2f3547]">{value}</p>
        </div>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#f5f7fc]">{icon}</span>
      </div>
    </article>
  );
}

function DetailsBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-3 rounded-lg border border-[#e3e8f3] bg-white p-3">
      <h3 className="mb-2 text-[0.75em] font-semibold text-[#414a62]">{title}</h3>
      {children}
    </section>
  );
}

function DetailRow({ label, value, subLabel }: { label: string; value: string; subLabel?: string }) {
  return (
    <div className="mb-1.5 flex items-start justify-between gap-3 text-[0.72em] text-[#616a81]">
      <div>
        <span>{label}</span>
        {subLabel ? <p className="mt-[0.12em] text-[0.9em] text-[#8a92a8]">{subLabel}</p> : null}
      </div>
      <span className="text-right font-medium text-[#4d556b]">{value}</span>
    </div>
  );
}
