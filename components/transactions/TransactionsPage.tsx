"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowUpDown, BanknoteArrowDown, CalendarDays, CheckCircle2, Copy, EllipsisVertical, Landmark, Wallet } from "lucide-react";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { TutorNavbar } from "../tutor/TutorNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { MetricCard } from "../ui/MetricCard";
import { DataToolbar } from "../ui/DataToolbar";
import { DataTableShell } from "../ui/DataTableShell";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
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
  { id: "B4927183010373", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 19, 2026", status: "Successful" },
  { id: "B4927183010374", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 19, 2026", status: "Successful" },
  { id: "B4927183010375", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 18, 2026", status: "Successful" },
  { id: "B4927183010376", amount: "₦16,050.50", method: "Card", type: "CR", date: "March 18, 2026", status: "Failed" },
  { id: "B4927183010377", amount: "₦24,760.00", method: "Card", type: "CR", date: "March 17, 2026", status: "Pending" },
  { id: "B4927183010378", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 17, 2026", status: "Successful" },
  { id: "B4927183010379", amount: "₦24,760.00", method: "Card", type: "CR", date: "March 16, 2026", status: "Pending" },
  { id: "B4927183010380", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 16, 2026", status: "Successful" },
  { id: "B4927183010381", amount: "₦16,050.50", method: "Card", type: "CR", date: "March 15, 2026", status: "Failed" },
  { id: "B4927183010382", amount: "₦11,037.50", method: "Bank Transfer", type: "CR", date: "March 15, 2026", status: "Successful" },
];

const statusTone: Record<TxStatus, StatusTone> = {
  Successful: "success",
  Pending: "warning",
  Failed: "danger",
};

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

type TransactionRole = "student" | "tutor";

const transactionMetrics = {
  student: [
    { label: "Total Value", value: "₦147,846.50", icon: <Wallet className="h-4 w-4 text-[#dca95a]" /> },
    { label: "Successful Transactions", value: "6", icon: <CheckCircle2 className="h-4 w-4 text-[#289c7f]" /> },
    { label: "Session Fees", value: "₦4,000", icon: <BanknoteArrowDown className="h-4 w-4 text-[#9553da]" /> },
    { label: "Finders Fees", value: "₦500", icon: <Landmark className="h-4 w-4 text-[#157ac8]" /> },
  ],
  tutor: [
    { label: "Total Value", value: "₦147,846.50", icon: <Wallet className="h-4 w-4 text-[#dca95a]" /> },
    { label: "Successful Transactions", value: "6", icon: <CheckCircle2 className="h-4 w-4 text-[#289c7f]" /> },
    { label: "Session Fees", value: "₦4,000", icon: <BanknoteArrowDown className="h-4 w-4 text-[#9553da]" /> },
  ],
} satisfies Record<TransactionRole, Array<{ label: string; value: string; icon: ReactNode }>>;

export default function TransactionsPage({ role = "student" }: { role?: TransactionRole }) {
  const [selectedStatus, setSelectedStatus] = useState<"All" | TxStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = transactions.filter((row) => {
      const statusPass = selectedStatus === "All" ? true : row.status === selectedStatus;
      const queryPass = !query || [row.id, row.amount, row.method, row.type, row.date, row.status].some((value) => value.toLowerCase().includes(query));
      const rowDate = new Date(row.date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      const fromPass = from ? rowDate >= from : true;
      const toPass = to ? rowDate <= to : true;
      const datePass = !Number.isNaN(rowDate.valueOf()) && fromPass && toPass;
      return statusPass && datePass && queryPass;
    });
    return [...rows].sort((first, second) => {
      const difference = new Date(second.date).valueOf() - new Date(first.date).valueOf();
      return newestFirst ? difference : -difference;
    });
  }, [dateFrom, dateTo, newestFirst, searchQuery, selectedStatus]);

  const openDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setShareFeedback("");
    setDetailsOpen(true);
  };

  const copyReference = async (id: string) => {
    await writeClipboard(id);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => current === id ? "" : current), 1600);
  };

  const shareDetails = async () => {
    if (!selectedTx) return;
    const text = `Transaction ${selectedTx.id}\n${selectedTx.amount} via ${selectedTx.method}\n${selectedTx.status} · ${selectedTx.date}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SP Novate transaction", text });
        setShareFeedback("Shared");
      } else {
        await writeClipboard(text);
        setShareFeedback("Details copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await writeClipboard(text);
      setShareFeedback("Details copied");
    }
  };

  const formatRangeLabel = dateFrom || dateTo
    ? `${dateFrom ? dateFrom.replaceAll("-", "/") : "..."} - ${dateTo ? dateTo.replaceAll("-", "/") : "..."}`
    : "All dates";
  const navbar = role === "tutor" ? <TutorNavbar active="Transactions" /> : <StudentDashboardNavbar active="Transactions" />;
  const metrics = transactionMetrics[role];

  return (
    <>
      <DashboardShell navbar={navbar}>
        <section className="w-full py-4 md:py-5">
              <div className={`grid gap-2.5 sm:grid-cols-2 ${metrics.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>
                {metrics.map((metric) => <MetricCard icon={metric.icon} key={metric.label} label={metric.label} value={metric.value} />)}
              </div>

              <div className="mt-5 sm:mt-6">
              <DataToolbar
                actions={(
                  <button className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-ui-border bg-white px-3 text-xs font-semibold text-ui-body hover:bg-[#f7f8fb] md:min-h-10" onClick={() => setNewestFirst((current) => !current)} type="button">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden sm:inline">{newestFirst ? "Newest" : "Oldest"}</span>
                  </button>
                )}
                onChange={(value) => {
                  setSearchQuery(value);
                }}
                placeholder="Search transactions"
                value={searchQuery}
              />
              </div>

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
                    <CalendarDays className="h-3 w-3" />
                  </button>
                  {isDateMenuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[16.25rem] rounded-xl border border-[#dfe4ef] bg-white p-3 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[19rem] 2xl:p-4">
                      <p className="mb-2 text-[0.78rem] font-semibold text-[#55607a] 2xl:mb-2.5 2xl:text-[0.92rem]">Pick date range</p>
                      <label className="mb-2 block text-[0.72rem] font-semibold text-[#7a8299] 2xl:mb-2.5 2xl:text-[0.84rem]">
                        From
                        <input className="mt-1 h-11 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] md:h-10 2xl:mt-1.5 2xl:text-[0.9rem]" onChange={(e) => setDateFrom(e.target.value)} type="date" value={dateFrom} />
                      </label>
                      <label className="block text-[0.72rem] font-semibold text-[#7a8299] 2xl:text-[0.84rem]">
                        To
                        <input className="mt-1 h-11 w-full rounded-md border border-[#d8deea] px-2 text-[0.78rem] md:h-10 2xl:mt-1.5 2xl:text-[0.9rem]" onChange={(e) => setDateTo(e.target.value)} type="date" value={dateTo} />
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
                    <span className="text-[0.9em]">+</span>
                  </button>
                  {isStatusMenuOpen ? (
                    <div className="absolute left-0 top-[calc(100%+0.45rem)] z-30 w-[11.9rem] rounded-xl border border-[#dfe4ef] bg-white p-2 shadow-[0_10px_28px_rgba(32,41,78,0.18)] 2xl:w-[13.8rem] 2xl:p-2.5">
                      {(["All", "Successful", "Pending", "Failed"] as const).map((status) => (
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
                        {["Status", "Reference", "Amount", "Method", "Type", "Date Created", ""].map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, idx) => (
                        <tr className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]" key={`${row.id}-${idx}`} onClick={() => openDetails(row)}>
                          <td className="px-3 py-2.5">
                            <StatusIndicator label={row.status} tone={statusTone[row.status]} />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-2">
                              {row.id}
                              <button aria-label={`Copy reference ${row.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#4b69d2] hover:bg-[#eef1fb]" onClick={(event) => { event.stopPropagation(); void copyReference(row.id); }} title={copiedId === row.id ? "Copied" : "Copy reference"} type="button">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          </td>
                          <td className="px-3 py-2.5">{row.amount}</td>
                          <td className="px-3 py-2.5">{row.method}</td>
                          <td className="px-3 py-2.5">{row.type}</td>
                          <td className="px-3 py-2.5">{row.date}</td>
                          <td className="px-3 py-2.5 text-right"><EllipsisVertical className="ml-auto h-3.5 w-3.5 text-[#6f768c]" /></td>
                        </tr>
                      ))}
                      {filteredRows.length === 0 ? (
                        <tr><td className="px-4 py-10 text-center text-sm text-[#7a8297]" colSpan={7}>No transactions match your search and filters.</td></tr>
                      ) : null}
                    </tbody>
                  </table>
              </DataTableShell>

              <div className="mt-3 space-y-1.5 pb-6 md:hidden">
                {filteredRows.map((row, idx) => (
                  <article className="rounded-lg border border-[#e6eaf3] bg-white px-3 py-2.5" key={`${row.id}-mobile-${idx}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="inline-flex max-w-full items-center gap-1.5 text-[0.76em] font-semibold text-[#2f3547]">
                          <span className="truncate">{row.id}</span>
                          <button aria-label={`Copy reference ${row.id}`} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#4b69d2]" onClick={() => void copyReference(row.id)} title={copiedId === row.id ? "Copied" : "Copy reference"} type="button">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-[0.64em] text-[#7a8299]">{row.method}</p>
                      </div>
                      <span className="text-[0.64em] text-[#7a8299]">{row.date}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <StatusIndicator className="text-[0.66em]" label={row.status} tone={statusTone[row.status]} />
                      <span className="text-[0.68em] font-semibold text-[#4a5166]">{row.amount}</span>
                    </div>
                    <button className="mt-2 min-h-11 w-full rounded-lg border border-[#e0e5f0] bg-[#fafbfe] text-[0.72em] font-semibold text-[#4f576d]" onClick={() => openDetails(row)} type="button">View transaction details</button>
                  </article>
                ))}
                {filteredRows.length === 0 ? <p className="rounded-lg border border-dashed border-[#dce1ec] px-4 py-10 text-center text-sm text-[#7a8297]">No transactions match your search and filters.</p> : null}
              </div>
        </section>
      </DashboardShell>

      <ResponsiveSheet
        ariaLabel="Transaction details"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        panelClassName="max-h-[100dvh] rounded-none border-0 px-0 pt-0 pb-[calc(env(safe-area-inset-bottom)+12px)] md:max-h-[92dvh] md:rounded-t-2xl md:border-t md:px-4 md:pt-3 xl:max-w-[560px] xl:rounded-l-xl xl:rounded-tr-none xl:border-l xl:px-5 xl:pt-5"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-[#eceff5] px-4 py-3 xl:px-1 xl:py-0 xl:pb-4">
            <button aria-label="Close transaction details" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#5a647e] xl:hidden" onClick={() => setDetailsOpen(false)} type="button">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="text-[0.94em] font-semibold text-[#2f3547]">Transaction details</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 xl:px-1 xl:py-0">
            <DetailsBlock title="Transaction summary">
              <DetailRow label="Reference" value={selectedTx?.id ?? "—"} />
              <DetailRow label="Status" value={selectedTx?.status ?? "—"} />
              <DetailRow label="Amount" value={selectedTx?.amount ?? "—"} />
              <DetailRow label="Payment method" value={selectedTx?.method ?? "—"} />
              <DetailRow label="Transaction type" value={selectedTx?.type ?? "—"} />
              <DetailRow label="Date created" value={selectedTx?.date ?? "—"} />
            </DetailsBlock>

            <DetailsBlock title="Cost estimate">
              <DetailRow label="Tutor's fee" value="₦3,500" />
              <DetailRow label="Weekly rate" value="₦7,000" subLabel="Based on 2 sessions per week and 1 hour per session" />
              <DetailRow label="Finder's fee" value="₦500" />
              <DetailRow label="VAT (7.5%)" value="₦37.50" />
              <DetailRow label="Subtotal" value={selectedTx?.amount ?? "₦11,037.50"} />
              <DetailRow label="Applicable taxes" value="₦0.00" />
              <div className="mt-2 flex items-center justify-between border-t border-[#e7ebf4] pt-2.5 text-[0.84em] font-semibold text-[#2f3547]">
                <span>Total cost</span>
                <span>{selectedTx?.amount ?? "₦11,037.50"}</span>
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
              <DetailRow label="Tutor's fee" value="₦3,500" />
            </DetailsBlock>
          </div>

          <div className="border-t border-[#eceff5] px-4 py-3 xl:px-1">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
              <button className="h-11 rounded-full bg-[#e5e7eb] px-6 text-[0.78em] font-semibold text-[#4f576d]" onClick={() => setDetailsOpen(false)} type="button">
                Close
              </button>
              <button className="h-11 rounded-full bg-[#262563] px-6 text-[0.78em] font-semibold text-white" onClick={() => void shareDetails()} type="button">
                {shareFeedback || "Share details"}
              </button>
            </div>
          </div>
        </div>
      </ResponsiveSheet>
    </>
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
