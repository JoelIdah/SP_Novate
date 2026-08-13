"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Archive,
  BookOpen,
  Boxes,
  Check,
  EllipsisVertical,
  Info,
  Lightbulb,
  Upload,
  Video,
} from "lucide-react";

import ResponsiveSheet from "../ui/ResponsiveSheet";
import { DashboardShell } from "../layout/DashboardShell";
import { DataToolbar } from "../ui/DataToolbar";
import { DataTableShell } from "../ui/DataTableShell";
import { TableFilters } from "../ui/TableFilters";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
import { TutorNavbar } from "./TutorNavbar";

type ResourceTab = "manage" | "archive";
type ResourceType = "Videos" | "Links" | "Docs.";
type ResourceStatus = "Published" | "Draft";
type ArchivedBy = "me" | "Admin";

type ResourceRow = {
  title: string;
  type: ResourceType;
  department: string;
  subject: string;
  date: string;
  duration: string;
  status: ResourceStatus;
  archivedBy: ArchivedBy;
};

const resources: ResourceRow[] = [
  { title: "Intro to data structure", type: "Videos", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Links", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Docs.", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Videos", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Draft", archivedBy: "Admin" },
  { title: "Intro to data structure", type: "Videos", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Links", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Links", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Links", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Published", archivedBy: "me" },
  { title: "Intro to data structure", type: "Docs.", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Draft", archivedBy: "Admin" },
  { title: "Intro to data structure", type: "Videos", department: "Academics", subject: "Entrance Exams", date: "March 15, 2026", duration: "1 Hour", status: "Draft", archivedBy: "Admin" },
];

const statusTone: Record<ResourceStatus | ArchivedBy, StatusTone> = {
  Published: "success",
  Draft: "info",
  me: "success",
  Admin: "info",
};

export default function TutorResourcesPage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>("manage");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedType, setSelectedType] = useState<ResourceType | "All">("All");
  const filteredResources = useMemo(() => resources.filter((row) => {
    const typePass = selectedType === "All" || row.type === selectedType;
    const rowDate = new Date(row.date);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return typePass
      && (!from || rowDate >= from)
      && (!to || rowDate <= to)
      && !Number.isNaN(rowDate.valueOf());
  }), [dateFrom, dateTo, selectedType]);
  const tableHeads = activeTab === "manage"
    ? ["Title", "Type", "Department", "Subject", "Date", "Duration", "Status", ""]
    : ["Title", "Type", "Department", "Subject", "Date", "Duration", "Archived by", ""];

  const closeCreate = () => setIsCreateOpen(false);
  const showSuccess = () => {
    setIsCreateOpen(false);
    setSuccessOpen(true);
  };

  return (
    <>
      <DashboardShell navbar={<TutorNavbar active="Resources" />}>
        <section className="w-full py-4 md:py-5">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#e4e8f2] pb-4">
                <TabButton active={activeTab === "manage"} icon={<Boxes className="h-3.5 w-3.5" />} label="Manage resources" onClick={() => setActiveTab("manage")} />
                <TabButton active={activeTab === "archive"} icon={<Archive className="h-3.5 w-3.5" />} label="Archive resources" onClick={() => setActiveTab("archive")} />
              </div>

              <section className="mt-3 grid items-center gap-4 rounded-xl bg-[#f3f6fb] px-4 py-5 sm:mt-5 sm:px-5 md:px-7 md:py-7 lg:grid-cols-[1fr_1.7fr]">
                <div>
                  <h1 className="text-xl font-semibold tracking-[-0.01em] text-ui-title sm:text-2xl">Create educational resources</h1>
                  <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ui-body">Upload and organize videos, links, and documents to support your students&apos; learning.</p>
                  <button className="mt-3 h-9 rounded-full bg-[#262563] px-4 text-[0.74em] font-semibold text-white sm:mt-5 sm:h-10 sm:px-5 sm:text-[0.78em]" onClick={() => setIsCreateOpen(true)} type="button">
                    Create Resource
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                  <FeatureCard icon={<Video className="h-4 w-4" />} iconClassName="bg-[#d9b4f8] text-[#8d4bd6]" title="Resources content" text="Upload educational materials to enhance your students&apos; learning" />
                  <FeatureCard icon={<BookOpen className="h-4 w-4" />} iconClassName="bg-[#b9eceb] text-[#168b8a]" title="Multiple subjects" text="Create resources across various departments and subjects" />
                  <FeatureCard icon={<Info className="h-4 w-4" />} iconClassName="bg-[#c4e6ff] text-[#2688d1]" title="Guidelines" text="Ensure courses are educational and aligns with the course objectives" />
                </div>
              </section>

              <div className="mt-4 md:mt-6"><DataToolbar placeholder="Search resource title or subject" /></div>

              <TableFilters
                className="mt-2.5"
                dateFrom={dateFrom}
                dateTo={dateTo}
                filters={[{ label: "Type", value: selectedType, options: ["All", "Videos", "Links", "Docs."], onChange: (value) => setSelectedType(value as ResourceType | "All") }]}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
              />

              <DataTableShell className="mt-4">
                  <table className="w-full min-w-[940px] border-collapse text-left text-[0.74em] text-[#5f667b]">
                    <thead className="bg-[#f2f5fa] text-[#525a6e]">
                      <tr>
                        {tableHeads.map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResources.map((row, index) => (
                        <tr className="border-t border-[#edf0f6] hover:bg-[#fafbff]" key={`${row.title}-${index}`}>
                          <td className="px-3 py-2.5">{row.title}</td>
                          <td className="px-3 py-2.5">{row.type}</td>
                          <td className="px-3 py-2.5">{row.department}</td>
                          <td className="px-3 py-2.5">{row.subject}</td>
                          <td className="px-3 py-2.5">{row.date}</td>
                          <td className="px-3 py-2.5">{row.duration}</td>
                          <td className="px-3 py-2.5">
                            <StatusIndicator label={activeTab === "manage" ? row.status : row.archivedBy} tone={activeTab === "manage" ? statusTone[row.status] : statusTone[row.archivedBy]} />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <EllipsisVertical className="ml-auto h-3.5 w-3.5 text-[#6f768c]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </DataTableShell>

              <div className="mt-3 space-y-1.5 pb-4 md:hidden">
                {filteredResources.map((row, index) => (
                  <article className="rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2" key={`${row.title}-mobile-${index}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[0.78em] font-semibold text-[#2f3547]">{row.title}</p>
                        <p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">{row.type} - {row.subject}</p>
                      </div>
                      <EllipsisVertical className="h-3.5 w-3.5 shrink-0 text-[#7b8296]" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[0.66em] text-[#596177]">
                      <span>{row.date}</span>
                      <StatusIndicator className="text-[0.66em]" label={activeTab === "manage" ? row.status : row.archivedBy} tone={activeTab === "manage" ? statusTone[row.status] : statusTone[row.archivedBy]} />
                    </div>
                  </article>
                ))}
              </div>
        </section>
      </DashboardShell>

      <CreateResourceSheet open={isCreateOpen} onClose={closeCreate} onCreate={showSuccess} />
      <SuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
    </>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-[0.76em] font-semibold ${
        active ? "bg-[#eef0ff] text-[#262563]" : "bg-[#f4f5f8] text-[#6d7488]"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function FeatureCard({ icon, iconClassName, title, text }: { icon: ReactNode; iconClassName: string; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-[#dfe5f0] bg-white p-4">
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClassName}`}>{icon}</span>
        <div>
          <h3 className="text-[0.86em] font-semibold text-[#2f3547]">{title}</h3>
          <p className="mt-1 text-[0.66em] leading-relaxed text-[#7a8299]">{text}</p>
        </div>
      </div>
    </article>
  );
}

function CreateResourceSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: () => void }) {
  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      backdropClassName="bg-[#1e1e1e]/45"
      panelClassName="max-h-[100dvh] rounded-none border-0 px-0 pt-0 pb-[calc(env(safe-area-inset-bottom)+12px)] md:max-h-[92dvh] md:rounded-t-2xl md:border-t md:px-4 md:pt-3 xl:max-w-[505px] xl:rounded-l-lg xl:rounded-tr-none xl:border-l xl:px-5 xl:pt-5"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[#eceff5] px-4 py-4 xl:px-0 xl:pb-5 xl:pt-0">
          <h2 className="text-[1.2rem] font-semibold text-[#1f2537]">Add Resources</h2>
          <p className="mt-1 text-[0.82rem] text-[#6f7891]">Upload or link materials for your students</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 xl:px-0">
          <div className="space-y-4">
            <Field label="Title">
              <input className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8]" defaultValue="Intro to data structure" />
            </Field>
            <Field label="Resource Type">
              <SelectLike value="Video" />
            </Field>
            <Field label="Department">
              <SelectLike value="Academics" />
            </Field>
            <Field label="Subjects">
              <SelectLike value="Entrance Exams" />
            </Field>
            <Field label="Description">
              <textarea className="h-28 w-full resize-none rounded-md border border-[#d7deeb] px-3 py-2 text-[0.82rem] outline-none placeholder:text-[#8f97aa] focus:border-[#6b68e8]" placeholder="Give a brief description of the resource..." />
              <p className="mt-1 text-[0.62rem] text-[#6f7891]">Must be at least 10 characters</p>
            </Field>
            <Field label="Upload Video">
              <button className="flex h-13 w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#7b82ec] bg-white text-[0.78rem] font-semibold text-[#1f2537]" type="button">
                <Upload className="h-4 w-4" />
                Upload Video here or <span className="text-[#3236ad]">Choose from your device</span>
              </button>
            </Field>
            <p className="flex items-start gap-1.5 text-[0.62rem] leading-relaxed text-[#4f576d]">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Please ensure video content is high quality and relevant to selected subject area. resources will be reviewed before being made available for students.
            </p>
          </div>
        </div>

        <div className="border-t border-[#eceff5] px-4 py-3 xl:px-0">
          <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-end">
            <button className="h-10 min-w-[10rem] rounded-full bg-[#f0f1f4] px-6 text-[0.78em] font-semibold text-[#2f3547]" onClick={onClose} type="button">Cancel</button>
            <button className="h-10 px-4 text-[0.78em] font-semibold text-[#4b49d8]" type="button">Save as draft</button>
            <button className="inline-flex h-10 min-w-[10rem] items-center justify-center gap-2 rounded-full bg-[#262563] px-6 text-[0.78em] font-semibold text-white" onClick={onCreate} type="button">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Create Resources
            </button>
          </div>
        </div>
      </div>
    </ResponsiveSheet>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-[0.74rem] font-semibold text-[#4f576d]">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function SelectLike({ value }: { value: string }) {
  return (
    <button className="flex h-10 w-full items-center justify-between rounded-md border border-[#d7deeb] px-3 text-left text-[0.82rem] text-[#1f2537]" type="button">
      {value}
      <span className="text-[#8f97aa]">v</span>
    </button>
  );
}

function SuccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1e1e1e]/45 px-4" onClick={onClose}>
      <div aria-labelledby="resource-success-title" aria-modal="true" className="w-full max-w-[310px] rounded-xl bg-white p-4 text-center shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff] text-[#4b49d8]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h2 className="mx-auto mt-5 max-w-[12rem] text-[1.15rem] font-semibold leading-tight text-[#1f2537]" id="resource-success-title">Resource created successfully</h2>
        <p className="mx-auto mt-2 max-w-[11rem] text-[0.74rem] leading-relaxed text-[#6f7891]">Your resource has been added successfully</p>
        <div className="mt-8 flex items-center gap-2 border-t border-[#edf0f6] pt-3">
          <button className="h-9 flex-1 rounded-full bg-[#f0f1f4] text-[0.74rem] font-semibold text-[#2f3547]" onClick={onClose} type="button">Cancel</button>
          <button className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-[#262563] text-[0.74rem] font-semibold text-white" onClick={onClose} type="button">
            <Check className="h-3 w-3" strokeWidth={3} />
            Continue to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
