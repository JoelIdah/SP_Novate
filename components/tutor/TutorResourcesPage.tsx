"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
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
import { apiFetch } from "../auth/apiClient";
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
type CreateResourceType = "video" | "link" | "docs";
type CreateResourceStatus = "draft" | "published";
type ResourceDeliveryMethod = "upload" | "link";

type CreateResourceForm = {
  title: string;
  deliveryMethod: ResourceDeliveryMethod;
  department: string;
  subject: string;
  description: string;
  linkUrl: string;
};

const initialCreateResourceForm: CreateResourceForm = {
  title: "",
  deliveryMethod: "upload",
  department: "",
  subject: "",
  description: "",
  linkUrl: "",
};

type ResourceRow = {
  title: string;
  type: ResourceType;
  department: string;
  subject: string;
  date: string;
  status: ResourceStatus;
  archivedBy: ArchivedBy;
};

const resources: ResourceRow[] = [];

const statusTone: Record<ResourceStatus | ArchivedBy, StatusTone> = {
  Published: "success",
  Draft: "info",
  me: "success",
  Admin: "info",
};

export default function TutorResourcesPage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>("manage");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successStatus, setSuccessStatus] = useState<CreateResourceStatus | null>(null);
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
    ? ["Title", "Type", "Department", "Subject", "Date", "Status", ""]
    : ["Title", "Type", "Department", "Subject", "Date", "Archived by", ""];

  const closeCreate = () => setIsCreateOpen(false);
  const showSuccess = (status: CreateResourceStatus) => {
    setIsCreateOpen(false);
    setSuccessStatus(status);
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
                  <table className="w-full min-w-[840px] border-collapse text-left text-[0.74em] text-[#5f667b]">
                    <thead className="bg-[#f2f5fa] text-[#525a6e]">
                      <tr>
                        {tableHeads.map((head) => (
                          <th key={head} className="px-3 py-2.5 font-semibold">{head}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResources.length === 0 ? <tr><td className="px-4 py-10 text-center text-sm text-[#8a93a7]" colSpan={7}>Your resources will appear here when resource data is available.</td></tr> : null}
                      {filteredResources.map((row, index) => (
                        <tr className="border-t border-[#edf0f6] hover:bg-[#fafbff]" key={`${row.title}-${index}`}>
                          <td className="px-3 py-2.5">{row.title}</td>
                          <td className="px-3 py-2.5">{row.type}</td>
                          <td className="px-3 py-2.5">{row.department}</td>
                          <td className="px-3 py-2.5">{row.subject}</td>
                          <td className="px-3 py-2.5">{row.date}</td>
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
                {filteredResources.length === 0 ? <p className="rounded-lg border border-dashed border-[#dce1ec] px-4 py-10 text-center text-sm text-[#8a93a7]">Your resources will appear here when resource data is available.</p> : null}
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
      <SuccessModal
        onClose={() => setSuccessStatus(null)}
        onCreateAnother={() => {
          setSuccessStatus(null);
          setIsCreateOpen(true);
        }}
        status={successStatus}
      />
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

function CreateResourceSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (status: CreateResourceStatus) => void }) {
  const [form, setForm] = useState<CreateResourceForm>(initialCreateResourceForm);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState<CreateResourceStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSubmitting = submittingStatus !== null;
  const acceptedFileTypes = ".mp4,.mov,.webm,.pdf,.doc,.docx,.ppt,.pptx";

  const updateField = <FieldName extends keyof CreateResourceForm>(field: FieldName, value: CreateResourceForm[FieldName]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const resetForm = () => {
    setForm(initialCreateResourceForm);
    setFile(null);
    setError("");
    setSubmittingStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.department.trim() || !form.subject.trim()) {
      return "Title, department, and subject are required.";
    }
    if (form.deliveryMethod === "link") {
      try {
        const url = new URL(form.linkUrl.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
      } catch {
        return "Enter a valid link beginning with http:// or https://.";
      }
    }
    if (form.deliveryMethod === "upload" && !file) {
      return "Choose a file to upload.";
    }
    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExtensions = ["mp4", "mov", "webm", "pdf", "doc", "docx", "ppt", "pptx"];
      if (!allowedExtensions.includes(extension)) {
        return "Upload an MP4, MOV, WEBM, PDF, DOC, DOCX, PPT, or PPTX file.";
      }
    }
    return "";
  };

  const submitResource = async (status: CreateResourceStatus) => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmittingStatus(status);
    setError("");

    const extension = file?.name.split(".").pop()?.toLowerCase();
    const resourceType: CreateResourceType = form.deliveryMethod === "link"
      ? "link"
      : ["mp4", "mov", "webm"].includes(extension ?? "") ? "video" : "docs";

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("type", resourceType);
    payload.append("department", form.department.trim());
    payload.append("subject", form.subject.trim());
    payload.append("status", status);
    if (form.description.trim()) payload.append("description", form.description.trim());
    if (form.deliveryMethod === "link") {
      payload.append("link_url", form.linkUrl.trim());
    } else if (file) {
      payload.append("file", file);
    }

    try {
      const response = await apiFetch("/v1/tutor/resources", {
        method: "POST",
        body: payload,
      });
      const responseData = (await response.json().catch(() => null)) as { message?: string } | null;

      if (response.status !== 201) {
        throw new Error(responseData?.message ?? "Could not create the resource.");
      }

      resetForm();
      onCreate(status);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create the resource.");
      setSubmittingStatus(null);
    }
  };

  return (
    <ResponsiveSheet
      open={open}
      onClose={handleClose}
      backdropClassName="bg-[#1e1e1e]/45"
      panelClassName="max-h-[100dvh] rounded-none border-0 px-0 pt-0 pb-[calc(env(safe-area-inset-bottom)+12px)] md:max-h-[92dvh] md:rounded-t-2xl md:border-t md:px-4 md:pt-3 xl:max-w-[505px] xl:rounded-l-lg xl:rounded-tr-none xl:border-l xl:px-5 xl:pt-5"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[#eceff5] px-4 py-4 xl:px-0 xl:pb-5 xl:pt-0">
          <h2 className="text-[1.2rem] font-semibold text-[#1f2537]">Add Resources</h2>
          <p className="mt-1 text-[0.82rem] text-[#6f7891]">Upload or link materials for your students</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:px-0">
          <div className="space-y-4">
            <Field label="Title">
              <input className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8]" disabled={isSubmitting} onChange={(event) => updateField("title", event.target.value)} placeholder="Enter resource title" value={form.title} />
            </Field>
            <Field label="Department">
              <input className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8]" disabled={isSubmitting} onChange={(event) => updateField("department", event.target.value)} placeholder="e.g. Academic" value={form.department} />
            </Field>
            <Field label="Subjects">
              <input className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8]" disabled={isSubmitting} onChange={(event) => updateField("subject", event.target.value)} placeholder="e.g. Exam Entrance" value={form.subject} />
            </Field>
            <Field label="Description">
              <textarea className="h-28 w-full resize-none rounded-md border border-[#d7deeb] px-3 py-2 text-[0.82rem] outline-none placeholder:text-[#8f97aa] focus:border-[#6b68e8]" disabled={isSubmitting} onChange={(event) => updateField("description", event.target.value)} placeholder="Give a brief description of the resource..." value={form.description} />
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-[0.74rem] font-semibold text-[#4f576d]">How would you like to add it?</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["upload", "link"] as const).map((method) => (
                  <button
                    aria-pressed={form.deliveryMethod === method}
                    className={`h-10 rounded-md border px-3 text-[0.78rem] font-semibold transition-colors ${form.deliveryMethod === method ? "border-[#5b58d6] bg-[#f0efff] text-[#3532a3]" : "border-[#d7deeb] bg-white text-[#626b80]"}`}
                    disabled={isSubmitting}
                    key={method}
                    onClick={() => {
                      updateField("deliveryMethod", method);
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    type="button"
                  >
                    {method === "upload" ? "Upload a file" : "Add a link"}
                  </button>
                ))}
              </div>
            </fieldset>
            {form.deliveryMethod === "link" ? (
              <Field label="Resource Link">
                <input className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8]" disabled={isSubmitting} onChange={(event) => updateField("linkUrl", event.target.value)} placeholder="https://example.com/resource" type="url" value={form.linkUrl} />
              </Field>
            ) : (
              <Field label="Upload file">
                <input
                  accept={acceptedFileTypes}
                  className="sr-only"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setError("");
                  }}
                  ref={fileInputRef}
                  type="file"
                />
                <span className={`flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#7b82ec] bg-white px-3 text-[0.78rem] font-semibold text-[#1f2537] ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}>
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">{file ? file.name : "Choose a video or document from your device"}</span>
                </span>
                <p className="mt-1 text-[0.62rem] font-normal text-[#6f7891]">MP4, MOV, WEBM, PDF, DOC, DOCX, PPT, or PPTX</p>
              </Field>
            )}
            <p className="flex items-start gap-1.5 text-[0.62rem] leading-relaxed text-[#4f576d]">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Please ensure the resource is high quality and relevant to the selected subject area. Resources may be reviewed before being made available to students.
            </p>
            {error ? <p className="rounded-md bg-[#fff1f1] px-3 py-2 text-[0.72rem] font-medium text-[#c63f3f]" role="alert">{error}</p> : null}
          </div>
        </div>

        <div className="border-t border-[#eceff5] px-4 py-3 xl:px-0">
          <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-end">
            <button className="h-10 min-w-[10rem] rounded-full bg-[#f0f1f4] px-6 text-[0.78em] font-semibold text-[#2f3547] disabled:opacity-60" disabled={isSubmitting} onClick={handleClose} type="button">Cancel</button>
            <button className="h-10 px-4 text-[0.78em] font-semibold text-[#4b49d8] disabled:opacity-60" disabled={isSubmitting} onClick={() => void submitResource("draft")} type="button">{submittingStatus === "draft" ? "Saving..." : "Save as draft"}</button>
            <button className="inline-flex h-10 min-w-[10rem] items-center justify-center gap-2 rounded-full bg-[#262563] px-6 text-[0.78em] font-semibold text-white disabled:opacity-60" disabled={isSubmitting} onClick={() => void submitResource("published")} type="button">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              {submittingStatus === "published" ? "Publishing..." : "Publish"}
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

function SuccessModal({ status, onClose, onCreateAnother }: { status: CreateResourceStatus | null; onClose: () => void; onCreateAnother: () => void }) {
  if (!status) return null;

  const isDraft = status === "draft";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1e1e1e]/45 px-4" onClick={onClose}>
      <div aria-labelledby="resource-success-title" aria-modal="true" className="w-full max-w-[310px] rounded-xl bg-white p-4 text-center shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff] text-[#4b49d8]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h2 className="mx-auto mt-5 max-w-[12rem] text-[1.15rem] font-semibold leading-tight text-[#1f2537]" id="resource-success-title">{isDraft ? "Draft saved" : "Resource published"}</h2>
        <p className="mx-auto mt-2 max-w-[12rem] text-[0.74rem] leading-relaxed text-[#6f7891]">{isDraft ? "You can return to finish and publish it later." : "Your resource is now available to students."}</p>
        <div className="mt-8 flex items-center gap-2 border-t border-[#edf0f6] pt-3">
          <button className="h-9 flex-1 rounded-full bg-[#f0f1f4] text-[0.74rem] font-semibold text-[#2f3547]" onClick={onClose} type="button">Done</button>
          <button className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-full bg-[#262563] text-[0.74rem] font-semibold text-white" onClick={onCreateAnother} type="button">
            <Check className="h-3 w-3" strokeWidth={3} />
            Create another
          </button>
        </div>
      </div>
    </div>
  );
}
