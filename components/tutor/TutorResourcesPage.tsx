"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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
import { requestJson } from "../auth/request";
import { DashboardShell } from "../layout/DashboardShell";
import { DataToolbar } from "../ui/DataToolbar";
import { DataTableShell } from "../ui/DataTableShell";
import { SelectMenu } from "../ui/SelectMenu";
import { TableFilters } from "../ui/TableFilters";
import { StatusIndicator, type StatusTone } from "../ui/StatusIndicator";
import { TutorNavbar } from "./TutorNavbar";

type ResourceTab = "manage" | "archive";
type ResourceType = "Videos" | "Links" | "Docs.";
type ResourceStatus = "Published" | "Draft";
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
  publicId: string;
  title: string;
  type: ResourceType;
  department: string;
  subject: string;
  date: string;
  status: ResourceStatus;
  isArchived: boolean;
  archivedBy: string;
  description: string;
  linkUrl: string;
};

type ResourceRecord = {
  public_id?: string;
  created_at?: string;
  date?: string;
  updated_at?: string;
  department: string;
  duration?: string;
  description?: string;
  is_archived?: boolean;
  link_url?: string;
  status?: CreateResourceStatus;
  archived_by?: string;
  subject: string;
  title: string;
  type: CreateResourceType;
};

type ResourcesResponse = {
  code?: number;
  data?: {
    data?: ResourceRecord[];
    page?: number;
    page_size?: number;
    total?: number;
    total_pages?: number;
  };
  message?: string;
  status?: string;
};

type ResourceCategory = {
  public_id: string;
  department: string;
  subjects: Array<{ category_id: number; subject: string }>;
};

type CategoriesResponse = {
  data?: ResourceCategory[];
  message?: string;
};

const displayType: Record<CreateResourceType, ResourceType> = {
  video: "Videos",
  link: "Links",
  docs: "Docs.",
};

const displayStatus: Record<CreateResourceStatus, ResourceStatus> = {
  published: "Published",
  draft: "Draft",
};

function formatResourceDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

const statusTone: Record<ResourceStatus, StatusTone> = {
  Published: "success",
  Draft: "info",
};

export default function TutorResourcesPage() {
  const [activeTab, setActiveTab] = useState<ResourceTab>("manage");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successStatus, setSuccessStatus] =
    useState<CreateResourceStatus | null>(null);
  const [selectedType, setSelectedType] = useState<ResourceType | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | "All">(
    "All",
  );
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date_asc" | "date_desc">("date_desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedResource, setSelectedResource] = useState<ResourceRow | null>(
    null,
  );
  const [resourceActionMode, setResourceActionMode] = useState<
    "edit" | "archive" | null
  >(null);
  const departmentOptions = categories.map((category) => category.department);
  const displayedResources = resources;
  const tableHeads =
    activeTab === "manage"
      ? ["Title", "Type", "Department", "Subject", "Date", "Status", ""]
      : ["Title", "Type", "Department", "Subject", "Date", "Archived by", ""];

  const closeCreate = () => setIsCreateOpen(false);
  const showSuccess = (status: CreateResourceStatus) => {
    setIsCreateOpen(false);
    setSuccessStatus(status);
    setPage(1);
    setRefreshKey((current) => current + 1);
  };
  const loadNextPage = () => {
    if (resourcesLoading || page >= totalPages) return;
    setResourcesLoading(true);
    setPage((current) => current + 1);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    const loadDepartments = async () => {
      try {
        const result = await requestJson("/api/categories", {
          signal: controller.signal,
        }) as CategoriesResponse;
        setCategories(result.data ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setCategories([]);
          setCategoriesError(
            error instanceof Error
              ? error.message
              : "Could not load departments and subjects.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    };
    void loadDepartments();
    return () => controller.abort();
  }, []);

  const loadResources = useCallback(
    async (signal?: AbortSignal) => {
      setResourcesLoading(true);
      setResourcesError("");
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
        sort_by: sortBy,
      });
      if (selectedType !== "All")
        params.set(
          "type",
          ({ Videos: "video", Links: "link", "Docs.": "docs" } as const)[
            selectedType
          ],
        );
      if (activeTab === "manage" && selectedStatus !== "All")
        params.set("status", selectedStatus.toLowerCase());
      if (selectedDepartment !== "All")
        params.set("department", selectedDepartment);
      if (search) params.set("search", search);
      try {
        const listPath =
          activeTab === "archive"
            ? "/api/tutor/resources/archived"
            : "/api/tutor/resources";
        const result = await requestJson(`${listPath}?${params.toString()}`, {
          signal,
        }) as ResourcesResponse;
        const payload = result.data;
        const nextResources = (payload?.data ?? []).map((resource) => ({
          publicId: resource.public_id ?? "",
          archivedBy: resource.archived_by ?? "—",
          date: formatResourceDate(resource.created_at ?? resource.date ?? ""),
          department: resource.department,
          description: resource.description ?? "",
          isArchived: activeTab === "archive" || Boolean(resource.is_archived),
          linkUrl: resource.link_url ?? "",
          status: resource.status ? displayStatus[resource.status] : "Draft",
          subject: resource.subject,
          title: resource.title,
          type: displayType[resource.type],
        }));
        setResources((current) =>
          page === 1
            ? nextResources
            : [
                ...current,
                ...nextResources.filter(
                  (candidate) =>
                    !current.some((existing) =>
                      candidate.publicId
                        ? existing.publicId === candidate.publicId
                        : existing.title === candidate.title &&
                          existing.date === candidate.date,
                    ),
                ),
              ],
        );
        setTotalPages(payload?.total_pages ?? 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        if (page === 1) setResources([]);
        setTotalPages(0);
        setResourcesError(
          error instanceof Error
            ? error.message
            : "Could not load your resources.",
        );
      } finally {
        if (!signal?.aborted) setResourcesLoading(false);
      }
    },
    [
      activeTab,
      page,
      search,
      selectedDepartment,
      selectedStatus,
      selectedType,
      sortBy,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => void loadResources(controller.signal),
      0,
    );
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [loadResources, refreshKey]);

  return (
    <>
      <DashboardShell navbar={<TutorNavbar active="Resources" />}>
        <section className="w-full py-4 md:py-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#e4e8f2] pb-4">
            <TabButton
              active={activeTab === "manage"}
              icon={<Boxes className="h-3.5 w-3.5" />}
              label="Manage resources"
              onClick={() => {
                setActiveTab("manage");
                setPage(1);
              }}
            />
            <TabButton
              active={activeTab === "archive"}
              icon={<Archive className="h-3.5 w-3.5" />}
              label="Archive resources"
              onClick={() => {
                setActiveTab("archive");
                setPage(1);
              }}
            />
          </div>

          <section className="mt-3 grid items-center gap-4 rounded-xl bg-[#f3f6fb] px-4 py-5 sm:mt-5 sm:px-5 md:px-7 md:py-7 lg:grid-cols-[1fr_1.7fr]">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.01em] text-ui-title sm:text-2xl">
                Create educational resources
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ui-body">
                Upload and organize videos, links, and documents to support your
                students&apos; learning.
              </p>
              <button
                className="mt-3 h-9 rounded-full bg-[#262563] px-4 text-[0.74em] font-semibold text-white sm:mt-5 sm:h-10 sm:px-5 sm:text-[0.78em]"
                onClick={() => setIsCreateOpen(true)}
                type="button"
              >
                Create Resource
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <FeatureCard
                icon={<Video className="h-4 w-4" />}
                iconClassName="bg-[#d9b4f8] text-[#8d4bd6]"
                title="Resources content"
                text="Upload educational materials to enhance your students' learning"
              />
              <FeatureCard
                icon={<BookOpen className="h-4 w-4" />}
                iconClassName="bg-[#b9eceb] text-[#168b8a]"
                title="Multiple subjects"
                text="Create resources across various departments and subjects"
              />
              <FeatureCard
                icon={<Info className="h-4 w-4" />}
                iconClassName="bg-[#c4e6ff] text-[#2688d1]"
                title="Guidelines"
                text="Ensure courses are educational and aligns with the course objectives"
              />
            </div>
          </section>

          <div className="mt-4 md:mt-6">
            <DataToolbar
              actions={
                <SelectMenu
                  ariaLabel="Sort resources"
                  buttonClassName="min-h-11 !w-[9rem] text-xs font-semibold md:min-h-10"
                  onChange={(value) => {
                    setSortBy(value as "date_asc" | "date_desc");
                    setPage(1);
                  }}
                  options={[
                    { label: "Newest first", value: "date_desc" },
                    { label: "Oldest first", value: "date_asc" },
                  ]}
                  placeholder="Sort resources"
                  value={sortBy}
                />
              }
              onChange={setSearchInput}
              placeholder="Search resource title or subject"
              value={searchInput}
            />
          </div>

          <TableFilters
            className="mt-2.5"
            filters={
              activeTab === "manage"
                ? [
                    {
                      label: "Type",
                      value: selectedType,
                      options: ["All", "Videos", "Links", "Docs."],
                      onChange: (value) => {
                        setSelectedType(value as ResourceType | "All");
                        setPage(1);
                      },
                    },
                    {
                      label: "Department",
                      value: selectedDepartment,
                      options: ["All", ...departmentOptions],
                      onChange: (value) => {
                        setSelectedDepartment(value);
                        setPage(1);
                      },
                    },
                    {
                      label: "Status",
                      value: selectedStatus,
                      options: ["All", "Published", "Draft"],
                      onChange: (value) => {
                        setSelectedStatus(value as ResourceStatus | "All");
                        setPage(1);
                      },
                    },
                  ]
                : [
                    {
                      label: "Type",
                      value: selectedType,
                      options: ["All", "Videos", "Links", "Docs."],
                      onChange: (value) => {
                        setSelectedType(value as ResourceType | "All");
                        setPage(1);
                      },
                    },
                    {
                      label: "Department",
                      value: selectedDepartment,
                      options: ["All", ...departmentOptions],
                      onChange: (value) => {
                        setSelectedDepartment(value);
                        setPage(1);
                      },
                    },
                  ]
            }
          />

          {resourcesError ? (
            <div
              className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]"
              role="alert"
            >
              <span>{resourcesError}</span>
              <button
                className="shrink-0 font-semibold underline"
                onClick={() => void loadResources()}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}

          <DataTableShell className="mt-4" onReachEnd={loadNextPage}>
            <table className="w-full min-w-[840px] border-collapse text-left text-[0.74em] text-[#5f667b]">
              <thead className="bg-[#f2f5fa] text-[#525a6e]">
                <tr>
                  {tableHeads.map((head) => (
                    <th key={head} className="px-3 py-2.5 font-semibold">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!resourcesLoading && displayedResources.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center text-sm text-[#8a93a7]"
                      colSpan={7}
                    >
                      {activeTab === "archive"
                        ? "No archived resources match the selected filters."
                        : "No resources match the selected filters."}
                    </td>
                  </tr>
                ) : null}
                {resourcesLoading && displayedResources.length === 0
                  ? Array.from({ length: 3 }, (_, rowIndex) => (
                      <tr
                        className="animate-pulse border-t border-[#edf0f6]"
                        key={`resource-skeleton-${rowIndex}`}
                      >
                        {tableHeads.map((head, cellIndex) => (
                          <td
                            className="px-3 py-3"
                            key={`${head}-${cellIndex}`}
                          >
                            <span
                              className={`block h-2.5 rounded-full bg-[#edf0f6] ${cellIndex === 0 ? "w-3/4" : cellIndex === 6 ? "ml-auto w-4" : "w-1/2"}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : null}
                {displayedResources.map((row, index) => (
                  <tr
                    className="border-t border-[#edf0f6] hover:bg-[#fafbff]"
                    key={row.publicId || `${row.title}-${index}`}
                  >
                    <td className="px-3 py-2.5">{row.title}</td>
                    <td className="px-3 py-2.5">{row.type}</td>
                    <td className="px-3 py-2.5">{row.department}</td>
                    <td className="px-3 py-2.5">{row.subject}</td>
                    <td className="px-3 py-2.5">{row.date}</td>
                    <td className="px-3 py-2.5">
                      <StatusIndicator
                        label={
                          activeTab === "manage" ? row.status : row.archivedBy
                        }
                        tone={
                          activeTab === "manage"
                            ? statusTone[row.status]
                            : "neutral"
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {activeTab === "manage" && row.publicId ? (
                        <ResourceMoreMenu
                          onArchive={() => {
                            setSelectedResource(row);
                            setResourceActionMode("archive");
                          }}
                          onEdit={() => {
                            setSelectedResource(row);
                            setResourceActionMode("edit");
                          }}
                          resource={row}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
                {resourcesLoading && displayedResources.length > 0 ? (
                  <tr>
                    <td
                      className="border-t border-[#edf0f6] px-4 py-3 text-center text-xs text-[#8a93a7]"
                      colSpan={7}
                      role="status"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d6daf0] border-t-[#4d43d7]" />
                        Loading more resources
                      </span>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </DataTableShell>

          <div className="mt-3 space-y-1.5 pb-4 md:hidden">
            {resourcesLoading && displayedResources.length === 0
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    className="animate-pulse rounded-lg border border-[#e6eaf3] bg-white px-3 py-3"
                    key={`mobile-resource-skeleton-${index}`}
                  >
                    <span className="block h-3 w-2/3 rounded-full bg-[#edf0f6]" />
                    <span className="mt-2 block h-2.5 w-2/5 rounded-full bg-[#f2f4f8]" />
                    <div className="mt-3 flex justify-between">
                      <span className="h-2.5 w-1/4 rounded-full bg-[#f2f4f8]" />
                      <span className="h-2.5 w-1/5 rounded-full bg-[#f2f4f8]" />
                    </div>
                  </div>
                ))
              : null}
            {!resourcesLoading && displayedResources.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#dce1ec] px-4 py-10 text-center text-sm text-[#8a93a7]">
                {activeTab === "archive"
                  ? "No archived resources match the selected filters."
                  : "No resources match the selected filters."}
              </p>
            ) : null}
            {displayedResources.map((row, index) => (
              <article
                className="rounded-lg border border-[#e6eaf3] bg-white px-2.5 py-2"
                key={`${row.publicId || `${row.title}-${index}`}-mobile`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[0.78em] font-semibold text-[#2f3547]">
                      {row.title}
                    </p>
                    <p className="mt-0.5 truncate text-[0.64em] text-[#7a8299]">
                      {row.type} - {row.subject}
                    </p>
                  </div>
                  {activeTab === "manage" && row.publicId ? (
                    <ResourceMoreMenu
                      onArchive={() => {
                        setSelectedResource(row);
                        setResourceActionMode("archive");
                      }}
                      onEdit={() => {
                        setSelectedResource(row);
                        setResourceActionMode("edit");
                      }}
                      resource={row}
                    />
                  ) : null}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[0.66em] text-[#596177]">
                  <span>{row.date}</span>
                  <StatusIndicator
                    className="text-[0.66em]"
                    label={activeTab === "manage" ? row.status : row.archivedBy}
                    tone={
                      activeTab === "manage"
                        ? statusTone[row.status]
                        : "neutral"
                    }
                  />
                </div>
              </article>
            ))}
            {resourcesLoading && displayedResources.length > 0 ? (
              <p
                className="flex items-center justify-center gap-2 py-3 text-xs text-[#8a93a7]"
                role="status"
              >
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#d6daf0] border-t-[#4d43d7]" />
                Loading more resources
              </p>
            ) : null}
            <InfiniteScrollTrigger
              enabled={!resourcesLoading && page < totalPages}
              onVisible={loadNextPage}
            />
          </div>
        </section>
      </DashboardShell>

      <CreateResourceSheet
        categories={categories}
        categoriesError={categoriesError}
        categoriesLoading={categoriesLoading}
        open={isCreateOpen}
        onClose={closeCreate}
        onCreate={showSuccess}
      />
      {selectedResource && resourceActionMode ? (
        <ResourceActionsSheet
          categories={categories}
          key={`${selectedResource.publicId}-${resourceActionMode}`}
          mode={resourceActionMode}
          onClose={() => {
            setSelectedResource(null);
            setResourceActionMode(null);
          }}
          onChanged={() => {
            setSelectedResource(null);
            setResourceActionMode(null);
            setRefreshKey((current) => current + 1);
          }}
          resource={selectedResource}
        />
      ) : null}
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

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
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

function InfiniteScrollTrigger({
  enabled,
  onVisible,
}: {
  enabled: boolean;
  onVisible: () => void;
}) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!enabled || !trigger) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { rootMargin: "160px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled, onVisible]);
  return <div aria-hidden className="h-px" ref={triggerRef} />;
}

function FeatureCard({
  icon,
  iconClassName,
  title,
  text,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-lg border border-[#dfe5f0] bg-white p-4">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClassName}`}
        >
          {icon}
        </span>
        <div>
          <h3 className="text-[0.86em] font-semibold text-[#2f3547]">
            {title}
          </h3>
          <p className="mt-1 text-[0.66em] leading-relaxed text-[#7a8299]">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

function ResourceMoreMenu({
  onArchive,
  onEdit,
  resource,
}: {
  onArchive: () => void;
  onEdit: () => void;
  resource: ResourceRow;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ right: 16, top: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedHeight =
        resource.type === "Links" && resource.linkUrl ? 132 : 92;
      setPosition({
        right: Math.max(8, window.innerWidth - rect.right),
        top:
          rect.bottom + estimatedHeight > window.innerHeight
            ? Math.max(8, rect.top - estimatedHeight)
            : rect.bottom + 5,
      });
    }
    setOpen((current) => !current);
  };

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={`More options for ${resource.title}`}
        className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#eef0f6]"
        onClick={toggle}
        ref={buttonRef}
        type="button"
      >
        <EllipsisVertical className="h-3.5 w-3.5 text-[#6f768c]" />
      </button>
      {open
        ? createPortal(
            <div
              className="fixed z-[90] min-w-40 overflow-hidden rounded-lg border border-[#dfe4ee] bg-white p-1.5 shadow-[0_12px_30px_rgba(31,40,74,0.16)]"
              ref={menuRef}
              style={{ right: position.right, top: position.top }}
            >
              <button
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-[#3f4759] hover:bg-[#f5f7fb]"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                type="button"
              >
                Edit
              </button>
              {resource.type === "Links" && resource.linkUrl ? (
                <a
                  className="flex h-10 items-center rounded-md px-3 text-sm font-semibold text-[#3f4759] hover:bg-[#f5f7fb]"
                  href={resource.linkUrl}
                  onClick={() => setOpen(false)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open link
                </a>
              ) : null}
              <button
                className="flex h-10 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-brand-danger hover:bg-[#fff4f4]"
                onClick={() => {
                  setOpen(false);
                  onArchive();
                }}
                type="button"
              >
                Archive
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function ResourceActionsSheet({
  categories,
  mode,
  onClose,
  onChanged,
  resource,
}: {
  categories: ResourceCategory[];
  mode: "edit" | "archive";
  onClose: () => void;
  onChanged: () => void;
  resource: ResourceRow;
}) {
  const [form, setForm] = useState({
    title: resource.title,
    department: resource.department,
    subject: resource.subject,
    description: resource.description,
    status: resource.status,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedCategory = categories.find(
    (category) => category.department === form.department,
  );
  const formReady = Boolean(
    form.title.trim() &&
    selectedCategory?.subjects.some(
      (subject) => subject.subject === form.subject,
    ),
  );

  const updateResource = async () => {
    if (!formReady || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await requestJson(
        `/api/tutor/resources/${encodeURIComponent(resource.publicId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            department: form.department,
            subject: form.subject,
            description: form.description.trim(),
            status: form.status.toLowerCase(),
          }),
        },
      );
      onChanged();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update the resource.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const archiveResource = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await requestJson(
        `/api/tutor/resources/${encodeURIComponent(resource.publicId)}/archive`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      onChanged();
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Could not archive the resource.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === "archive") {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/40 px-4"
        onClick={submitting ? undefined : onClose}
      >
        <section
          aria-labelledby="archive-resource-title"
          aria-modal="true"
          className="w-full max-w-[390px] rounded-2xl border border-[#e6e9f1] bg-white p-5 shadow-[0_24px_60px_rgba(26,33,67,0.22)]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
        >
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1f1] text-brand-danger">
            <Archive className="h-5 w-5" />
          </div>
          <h2
            className="mt-4 text-center text-lg font-semibold text-[#1f2537]"
            id="archive-resource-title"
          >
            Archive resource?
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-[#6f7891]">
            “{resource.title}” will move from Manage resources to the Archive
            tab.
          </p>
          {error ? (
            <p
              className="mt-4 rounded-md bg-[#fff1f1] px-3 py-2 text-xs font-medium text-[#c63f3f]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              className="h-10 rounded-full bg-[#f0f1f4] text-sm font-semibold text-[#2f3547]"
              disabled={submitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-full bg-brand-danger text-sm font-semibold text-white disabled:opacity-50"
              disabled={submitting}
              onClick={() => void archiveResource()}
              type="button"
            >
              {submitting ? "Archiving..." : "Archive"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <ResponsiveSheet
      open
      onClose={submitting ? () => undefined : onClose}
      panelClassName="max-h-[92dvh] xl:max-w-[440px]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[#eceff5] px-4 py-4 xl:px-0 xl:pt-0">
          <h2 className="text-lg font-semibold text-[#1f2537]">
            Edit resource
          </h2>
          <p className="mt-1 text-xs text-[#6f7891]">
            The file or link cannot be replaced when editing.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 xl:px-0">
          <div className="space-y-4">
            <Field label="Title">
              <input
                className="h-10 w-full rounded-md border border-[#d7deeb] px-3 text-sm outline-none focus:border-[#6b68e8]"
                disabled={submitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                value={form.title}
              />
            </Field>
            <Field label="Department">
              <SelectMenu
                buttonClassName="!h-10 !rounded-md"
                disabled={submitting}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    department: value,
                    subject: "",
                  }))
                }
                options={categories.map((category) => ({ label: category.department, value: category.department }))}
                placeholder="Select department"
                value={form.department}
              />
            </Field>
            <Field label="Subject">
              <SelectMenu
                buttonClassName="!h-10 !rounded-md"
                disabled={submitting || !selectedCategory}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    subject: value,
                  }))
                }
                options={selectedCategory?.subjects.map((subject) => ({ label: subject.subject, value: subject.subject })) ?? []}
                placeholder="Select subject"
                value={form.subject}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="h-28 w-full resize-none rounded-md border border-[#d7deeb] px-3 py-2 text-sm outline-none"
                disabled={submitting}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                value={form.description}
              />
            </Field>
            <Field label="Status">
              <SelectMenu
                buttonClassName="!h-10 !rounded-md"
                disabled={submitting}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as ResourceStatus,
                  }))
                }
                options={[{ label: "Draft", value: "Draft" }, { label: "Published", value: "Published" }]}
                placeholder="Select status"
                value={form.status}
              />
            </Field>
          </div>
          {error ? (
            <p
              className="mt-4 rounded-md bg-[#fff1f1] px-3 py-2 text-xs font-medium text-[#c63f3f]"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2 border-t border-[#eceff5] px-4 py-3 xl:px-0">
          <button
            className="h-10 flex-1 rounded-full bg-[#f0f1f4] text-sm font-semibold text-[#2f3547]"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 flex-1 rounded-full bg-[#262563] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!formReady || submitting}
            onClick={() => void updateResource()}
            type="button"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </ResponsiveSheet>
  );
}

function CreateResourceSheet({
  categories,
  categoriesError,
  categoriesLoading,
  open,
  onClose,
  onCreate,
}: {
  categories: ResourceCategory[];
  categoriesError: string;
  categoriesLoading: boolean;
  open: boolean;
  onClose: () => void;
  onCreate: (status: CreateResourceStatus) => void;
}) {
  const [form, setForm] = useState<CreateResourceForm>(
    initialCreateResourceForm,
  );
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submittingStatus, setSubmittingStatus] =
    useState<CreateResourceStatus | null>(null);
  const [touched, setTouched] = useState({
    title: false,
    department: false,
    subject: false,
    linkUrl: false,
    file: false,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isSubmitting = submittingStatus !== null;
  const acceptedFileTypes = ".mp4,.mov,.webm,.pdf,.doc,.docx,.ppt,.pptx";
  const allowedExtensions = [
    "mp4",
    "mov",
    "webm",
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
  ];
  const selectedCategory = categories.find(
    (category) => category.department === form.department,
  );
  const titleValid = Boolean(form.title.trim());
  const departmentValid = Boolean(selectedCategory);
  const subjectValid = Boolean(
    selectedCategory?.subjects.some(
      (subject) => subject.subject === form.subject,
    ),
  );
  const linkValid = (() => {
    if (form.deliveryMethod !== "link") return true;
    try {
      const url = new URL(form.linkUrl.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  })();
  const fileExtension = file?.name.split(".").pop()?.toLowerCase() ?? "";
  const fileValid =
    form.deliveryMethod !== "upload" ||
    Boolean(file && allowedExtensions.includes(fileExtension));
  const formReady =
    titleValid && departmentValid && subjectValid && linkValid && fileValid;

  const updateField = <FieldName extends keyof CreateResourceForm>(
    field: FieldName,
    value: CreateResourceForm[FieldName],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const resetForm = () => {
    setForm(initialCreateResourceForm);
    setFile(null);
    setError("");
    setSubmittingStatus(null);
    setTouched({
      title: false,
      department: false,
      subject: false,
      linkUrl: false,
      file: false,
    });
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
    const validCategory = categories.find(
      (category) => category.department === form.department,
    );
    if (
      !validCategory?.subjects.some(
        (subject) => subject.subject === form.subject,
      )
    ) {
      return "Select a valid subject from the chosen department.";
    }
    if (form.deliveryMethod === "link") {
      try {
        const url = new URL(form.linkUrl.trim());
        if (url.protocol !== "http:" && url.protocol !== "https:")
          throw new Error();
      } catch {
        return "Enter a valid link beginning with http:// or https://.";
      }
    }
    if (form.deliveryMethod === "upload" && !file) {
      return "Choose a file to upload.";
    }
    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExtensions.includes(extension)) {
        return "Upload an MP4, MOV, WEBM, PDF, DOC, DOCX, PPT, or PPTX file.";
      }
    }
    return "";
  };

  const attemptSubmit = (status: CreateResourceStatus) => {
    if (!formReady) {
      setTouched({
        title: true,
        department: true,
        subject: true,
        linkUrl: true,
        file: true,
      });
      setError("Review the highlighted fields before continuing.");
      return;
    }
    void submitResource(status);
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
    const resourceType: CreateResourceType =
      form.deliveryMethod === "link"
        ? "link"
        : ["mp4", "mov", "webm"].includes(extension ?? "")
          ? "video"
          : "docs";

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("type", resourceType);
    payload.append("department", form.department.trim());
    payload.append("subject", form.subject.trim());
    payload.append("status", status);
    if (form.description.trim())
      payload.append("description", form.description.trim());
    if (form.deliveryMethod === "link") {
      payload.append("link_url", form.linkUrl.trim());
    } else if (file) {
      payload.append("file", file);
    }

    try {
      await requestJson("/api/tutor/resources", {
        method: "POST",
        body: payload,
      });

      resetForm();
      onCreate(status);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create the resource.",
      );
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
          <h2 className="text-[1.2rem] font-semibold text-[#1f2537]">
            Add Resources
          </h2>
          <p className="mt-1 text-[0.82rem] text-[#6f7891]">
            Upload or link materials for your students
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:px-0">
          <div className="space-y-4">
            <Field label="Title">
              <input
                aria-invalid={touched.title && !titleValid}
                className={`h-10 w-full rounded-md border px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8] ${touched.title && !titleValid ? "border-brand-danger" : "border-[#d7deeb]"}`}
                disabled={isSubmitting}
                onBlur={() =>
                  setTouched((current) => ({ ...current, title: true }))
                }
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Enter resource title"
                value={form.title}
              />
              {touched.title && !titleValid ? (
                <FieldError>Enter a resource title.</FieldError>
              ) : null}
            </Field>
            <Field label="Department">
              <SelectMenu
                buttonClassName="!h-10 !rounded-md !text-[0.82rem]"
                disabled={
                  isSubmitting || categoriesLoading || categories.length === 0
                }
                invalid={touched.department && !departmentValid}
                onBlur={() =>
                  setTouched((current) => ({ ...current, department: true }))
                }
                onChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    department: value,
                    subject: "",
                  }));
                  setTouched((current) => ({ ...current, subject: false }));
                  setError("");
                }}
                options={categories.map((category) => ({
                  label: category.department,
                  value: category.department,
                }))}
                placeholder={
                  categoriesLoading
                    ? "Loading departments..."
                    : "Select department"
                }
                value={form.department}
              />
              {touched.department && !departmentValid ? (
                <FieldError>Select a department.</FieldError>
              ) : null}
            </Field>
            <Field label="Subjects">
              <SelectMenu
                buttonClassName="!h-10 !rounded-md !text-[0.82rem]"
                disabled={isSubmitting || !selectedCategory}
                invalid={touched.subject && !subjectValid}
                onBlur={() =>
                  setTouched((current) => ({ ...current, subject: true }))
                }
                onChange={(value) => updateField("subject", value)}
                options={
                  selectedCategory?.subjects.map((subject) => ({
                    label: subject.subject,
                    value: subject.subject,
                  })) ?? []
                }
                placeholder="Select subject"
                value={form.subject}
              />
              {touched.subject && !subjectValid ? (
                <FieldError>Select a subject.</FieldError>
              ) : null}
            </Field>
            {categoriesError ? (
              <p
                className="rounded-md border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]"
                role="alert"
              >
                {categoriesError}
              </p>
            ) : null}
            <Field label="Description">
              <textarea
                className="h-28 w-full resize-none rounded-md border border-[#d7deeb] px-3 py-2 text-[0.82rem] outline-none placeholder:text-[#8f97aa] focus:border-[#6b68e8]"
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Give a brief description of the resource..."
                value={form.description}
              />
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-[0.74rem] font-semibold text-[#4f576d]">
                How would you like to add it?
              </legend>
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
                      setTouched((current) => ({
                        ...current,
                        file: false,
                        linkUrl: false,
                      }));
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
                <input
                  aria-invalid={touched.linkUrl && !linkValid}
                  className={`h-10 w-full rounded-md border px-3 text-[0.82rem] text-[#1f2537] outline-none focus:border-[#6b68e8] ${touched.linkUrl && !linkValid ? "border-brand-danger" : "border-[#d7deeb]"}`}
                  disabled={isSubmitting}
                  onBlur={() =>
                    setTouched((current) => ({ ...current, linkUrl: true }))
                  }
                  onChange={(event) =>
                    updateField("linkUrl", event.target.value)
                  }
                  placeholder="https://example.com/resource"
                  type="url"
                  value={form.linkUrl}
                />
                {touched.linkUrl && !linkValid ? (
                  <FieldError>
                    Enter a valid link beginning with http:// or https://.
                  </FieldError>
                ) : null}
              </Field>
            ) : (
              <Field label="Upload file">
                <input
                  accept={acceptedFileTypes}
                  className="sr-only"
                  disabled={isSubmitting}
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null);
                    setTouched((current) => ({ ...current, file: true }));
                    setError("");
                  }}
                  ref={fileInputRef}
                  type="file"
                />
                <span
                  className={`flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#7b82ec] bg-white px-3 text-[0.78rem] font-semibold text-[#1f2537] ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {file
                      ? file.name
                      : "Choose a video or document from your device"}
                  </span>
                </span>
                <p className="mt-1 text-[0.62rem] font-normal text-[#6f7891]">
                  MP4, MOV, WEBM, PDF, DOC, DOCX, PPT, or PPTX
                </p>
                {touched.file && !fileValid ? (
                  <FieldError>Choose a supported video or document.</FieldError>
                ) : null}
              </Field>
            )}
            <p className="flex items-start gap-1.5 text-[0.62rem] leading-relaxed text-[#4f576d]">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Please ensure the resource is high quality and relevant to the
              selected subject area. Resources may be reviewed before being made
              available to students.
            </p>
            {error ? (
              <p
                className="rounded-md bg-[#fff1f1] px-3 py-2 text-[0.72rem] font-medium text-[#c63f3f]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#eceff5] px-4 py-3 xl:px-0">
          <div className="flex flex-col-reverse gap-2 md:flex-row md:items-center md:justify-end">
            <button
              className="h-10 min-w-[10rem] rounded-full bg-[#f0f1f4] px-6 text-[0.78em] font-semibold text-[#2f3547] disabled:opacity-60"
              disabled={isSubmitting}
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
            <button
              aria-disabled={isSubmitting || !formReady}
              className="h-10 px-4 text-[0.78em] font-semibold text-[#4b49d8] aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
              disabled={isSubmitting}
              onClick={() => attemptSubmit("draft")}
              type="button"
            >
              {submittingStatus === "draft" ? "Saving..." : "Save as draft"}
            </button>
            <button
              aria-disabled={isSubmitting || !formReady}
              className="inline-flex h-10 min-w-[10rem] items-center justify-center gap-2 rounded-full bg-[#262563] px-6 text-[0.78em] font-semibold text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
              disabled={isSubmitting}
              onClick={() => attemptSubmit("published")}
              type="button"
            >
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

function FieldError({ children }: { children: ReactNode }) {
  return (
    <span
      className="mt-1 block text-[0.68rem] font-medium text-brand-danger"
      role="alert"
    >
      {children}
    </span>
  );
}

function SuccessModal({
  status,
  onClose,
  onCreateAnother,
}: {
  status: CreateResourceStatus | null;
  onClose: () => void;
  onCreateAnother: () => void;
}) {
  if (!status) return null;

  const isDraft = status === "draft";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1e1e1e]/45 px-4"
      onClick={onClose}
    >
      <div
        aria-labelledby="resource-success-title"
        aria-modal="true"
        className="w-full max-w-[310px] rounded-xl bg-white p-4 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff] text-[#4b49d8]">
          <Lightbulb className="h-5 w-5" />
        </div>
        <h2
          className="mx-auto mt-5 max-w-[12rem] text-[1.15rem] font-semibold leading-tight text-[#1f2537]"
          id="resource-success-title"
        >
          {isDraft ? "Draft saved" : "Resource published"}
        </h2>
        <p className="mx-auto mt-2 max-w-[12rem] text-[0.74rem] leading-relaxed text-[#6f7891]">
          {isDraft
            ? "You can return to finish and publish it later."
            : "Your resource is now available to students."}
        </p>
        <div className="mt-6 grid gap-2 border-t border-[#edf0f6] pt-4">
          <button
            className="h-10 w-full rounded-full bg-[#262563] text-[0.78rem] font-semibold text-white"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-full border border-[#d8deed] bg-white text-[0.76rem] font-semibold text-[#4b49d8]"
            onClick={onCreateAnother}
            type="button"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
            Create another
          </button>
        </div>
      </div>
    </div>
  );
}
