"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, BanknoteArrowDown, CheckCircle2, Copy, EllipsisVertical, Landmark, Wallet } from "lucide-react";

import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { TutorNavbar } from "../tutor/TutorNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { DataTableShell } from "../ui/DataTableShell";
import { MetricCard } from "../ui/MetricCard";
import { InfiniteScrollTrigger } from "../ui/InfiniteScrollTrigger";
import ResponsiveSheet from "../ui/ResponsiveSheet";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
import { TableFilters } from "../ui/TableFilters";
import {
  getTransactionDetails,
  getTransactions,
  getTransactionStats,
  type Transaction,
  type TransactionDetails,
  type TransactionRole,
  type TransactionStats,
} from "./transactions";

const PAGE_SIZE = 20;
function number(value: number | undefined) {
  return value === undefined ? "—" : new Intl.NumberFormat().format(value);
}

function words(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function tone(status: string): StatusTone {
  if (status.toLowerCase() === "success") return "success";
  if (status.toLowerCase() === "pending") return "warning";
  if (status.toLowerCase() === "failed") return "danger";
  return "neutral";
}

async function copy(text: string) {
  await navigator.clipboard.writeText(text);
}

export default function TransactionsPage({ role }: { role: TransactionRole }) {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [details, setDetails] = useState<TransactionDetails | null>(null);
  const [detailsError, setDetailsError] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getTransactionStats(role, controller.signal)
      .then(setStats)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setError(reason instanceof Error ? reason.message : "Transactions could not be loaded.");
        }
      });
    return () => controller.abort();
  }, [role]);

  useEffect(() => {
    const controller = new AbortController();
    getTransactions(role, { date: date || undefined, page, pageSize: PAGE_SIZE, status: status || undefined }, controller.signal)
      .then((result) => {
        setRows((current) => page === 1 ? result.data : [...current, ...result.data]);
        setTotal(result.total);
        setTotalPages(Math.max(result.total_pages, 1));
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setError(reason instanceof Error ? reason.message : "Transactions could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [date, page, role, status]);

  const openDetails = (transaction: Transaction) => {
    setSelected(transaction);
    setDetails(null);
    setDetailsError("");
    setDetailsLoading(true);
    const controller = new AbortController();
    getTransactionDetails(role, transaction.reference, controller.signal)
      .then(setDetails)
      .catch((reason: unknown) => setDetailsError(reason instanceof Error ? reason.message : "Transaction details could not be loaded."))
      .finally(() => setDetailsLoading(false));
  };

  const metrics = [
    { label: "Total volume", value: number(stats?.total_volume), icon: <Wallet className="h-4 w-4 text-[#dca95a]" /> },
    { label: "Successful transactions", value: number(stats?.total_successful_transactions), icon: <CheckCircle2 className="h-4 w-4 text-[#289c7f]" /> },
    { label: "Session fees", value: number(stats?.total_session_fee), icon: <BanknoteArrowDown className="h-4 w-4 text-[#9553da]" /> },
    { label: role === "tutor" ? "Service fees" : "Finder's fees", value: number(role === "tutor" ? stats?.total_service_fee : stats?.total_finders_fee), icon: <Landmark className="h-4 w-4 text-[#157ac8]" /> },
  ];

  return (
    <>
      <DashboardShell navbar={role === "tutor" ? <TutorNavbar active="Transactions" /> : <StudentDashboardNavbar active="Transactions" />}>
        <section className="w-full py-4 md:py-5">
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => <MetricCard {...metric} key={metric.label} />)}
          </div>

          <TableFilters className="mt-5" date={date} filters={[{ label: "Status", value: status ? "Successful" : "All", options: ["All", "Successful"], onChange: (value) => { setLoading(true); setError(""); setStatus(value === "Successful" ? "success" : ""); setPage(1); } }]} onDateChange={(value) => { setLoading(true); setError(""); setDate(value); setPage(1); }} />

          {error ? <p className="mt-3 rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3 py-2 text-sm text-brand-danger">{error}</p> : null}

          <DataTableShell className="mt-3">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs text-[#5f667b]">
              <thead className="bg-[#f2f5fa] text-[#676f85]"><tr>{["Status", "Reference", "Amount", "Method", "Type", "Date Created", ""].map((head) => <th className="px-3 py-2.5 font-semibold" key={head}>{head}</th>)}</tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="cursor-pointer border-t border-[#edf0f6] hover:bg-[#fafbff]" key={row.reference} onClick={() => openDetails(row)}>
                    <td className="px-3 py-2.5"><StatusIndicator label={words(row.status)} tone={tone(row.status)} /></td>
                    <td className="px-3 py-2.5"><span className="inline-flex items-center gap-2">{row.reference}<button aria-label={`Copy reference ${row.reference}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#4b69d2] hover:bg-[#eef1fb]" onClick={(event) => { event.stopPropagation(); void copy(row.reference).then(() => setCopied(row.reference)); }} title={copied === row.reference ? "Copied" : "Copy reference"} type="button"><Copy className="h-3.5 w-3.5" /></button></span></td>
                    <td className="px-3 py-2.5">{number(row.amount)}</td>
                    <td className="px-3 py-2.5">{words(row.method)}</td>
                    <td className="px-3 py-2.5">{row.tx_type}</td>
                    <td className="px-3 py-2.5">{row.date}</td>
                    <td className="px-3 py-2.5 text-right"><EllipsisVertical className="ml-auto h-3.5 w-3.5" /></td>
                  </tr>
                ))}
                {!loading && rows.length === 0 ? <tr><td className="px-4 py-10 text-center text-sm text-[#7a8297]" colSpan={7}>No transactions found.</td></tr> : null}
                {loading ? <tr><td className="px-4 py-10 text-center text-sm text-[#7a8297]" colSpan={7}>Loading transactions…</td></tr> : null}
              </tbody>
            </table>
          </DataTableShell>

          <p className="mt-3 text-xs text-ui-body">{number(total)} transaction{total === 1 ? "" : "s"}</p>
          {loading && page > 1 ? <p className="py-3 text-center text-xs text-[#8a93a7]" role="status">Loading more transactions...</p> : null}
          <InfiniteScrollTrigger enabled={!loading && page < totalPages} onVisible={() => { setLoading(true); setError(""); setPage((current) => current + 1); }} />
        </section>
      </DashboardShell>

      <ResponsiveSheet ariaLabel="Transaction details" open={Boolean(selected)} onClose={() => setSelected(null)} panelClassName="max-h-[100dvh] rounded-none border-0 px-0 pt-0 pb-[calc(env(safe-area-inset-bottom)+12px)] md:max-h-[92dvh] md:rounded-t-2xl md:border-t md:px-4 md:pt-3 xl:max-w-[560px] xl:rounded-l-xl xl:rounded-tr-none xl:border-l xl:px-5 xl:pt-5">
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-[#eceff5] px-4 py-3 xl:px-1 xl:py-0 xl:pb-4"><button aria-label="Close transaction details" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#5a647e] xl:hidden" onClick={() => setSelected(null)} type="button"><ArrowLeft className="h-4 w-4" /></button><p className="text-sm font-semibold text-[#2f3547]">Transaction details</p></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 xl:px-1">
            <DetailsBlock title="Transaction summary">
              <DetailRow label="Reference" value={selected?.reference ?? "—"} />
              <DetailRow label="Status" value={selected ? words(selected.status) : "—"} />
              <DetailRow label="Amount charged" value={number(selected?.amount)} />
              <DetailRow label="Payment method" value={selected ? words(selected.method) : "—"} />
              <DetailRow label="Transaction type" value={selected?.tx_type ?? "—"} />
              <DetailRow label="Date created" value={selected?.date ?? "—"} />
            </DetailsBlock>
            {detailsLoading ? <p className="py-8 text-center text-sm text-[#7a8297]">Loading details…</p> : null}
            {detailsError ? <p className="rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3 py-2 text-sm text-brand-danger">{detailsError}</p> : null}
            {details ? <>
              <DetailsBlock title="Cost estimate">
                <DetailRow label="Tutor fee" value={number(details.estimate.tutor_fee)} />
                <DetailRow label="Weekly rate" value={number(details.estimate.weekly_rate)} />
                <DetailRow label="Finder's fee" value={number(details.estimate.finders_fee)} />
                <DetailRow label={`VAT (${number(details.estimate.vat_percent)}%)`} value={number(details.estimate.vat)} />
                <DetailRow label="Subtotal" value={number(details.estimate.subtotal)} />
                <DetailRow label="Payment status" value={words(details.estimate.payment_status)} />
                <div className="mt-2 flex items-center justify-between border-t border-[#e7ebf4] pt-2.5 text-sm font-semibold text-[#2f3547]"><span>Total cost</span><span>{number(details.estimate.total)}</span></div>
              </DetailsBlock>
              <DetailsBlock title="Booking summary">
                <DetailRow label="Department" value={details.summary.department} />
                <DetailRow label="Session type" value={words(details.summary.session_type)} />
                <DetailRow label="Period" value={words(details.summary.period)} />
                <DetailRow label="Number of weeks" value={number(details.summary.number_of_weeks)} />
                <DetailRow label="Hours per day" value={number(details.summary.hours_per_day)} />
                <DetailRow label="Payment option" value={words(details.summary.payment_option)} />
                <DetailRow label="Availability" value={details.summary.availability.map(words).join(", ")} />
                <DetailRow label="Tutor fee" value={number(details.summary.tutor_fee)} />
              </DetailsBlock>
            </> : null}
          </div>
          <div className="border-t border-[#eceff5] px-4 py-3 xl:px-1"><button className="h-11 w-full rounded-full bg-[#e5e7eb] px-6 text-xs font-semibold text-[#4f576d]" onClick={() => setSelected(null)} type="button">Close</button></div>
        </div>
      </ResponsiveSheet>
    </>
  );
}

function DetailsBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-3 rounded-lg border border-[#e3e8f3] bg-white p-3"><h3 className="mb-2 text-xs font-semibold text-[#414a62]">{title}</h3>{children}</section>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="mb-1.5 flex items-start justify-between gap-3 text-xs text-[#616a81]"><span>{label}</span><span className="text-right font-medium text-[#4d556b]">{value}</span></div>;
}
