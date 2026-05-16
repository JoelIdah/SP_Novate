import {
  DashboardBookingsSection,
  DashboardMessagesSection,
  DashboardResourcesSection,
} from "./DashboardSections";

function TutorActionsSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.93rem] font-semibold text-[#616a82]">Actions</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-[#e4d2fa] bg-[#f9f3ff] px-4 py-4">
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Set up subjects</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">Go to your chat with the tutors</p>
        </article>
        <article className="rounded-lg border border-[#b9dcf8] bg-[#f3f9ff] px-4 py-4">
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Create a new resource</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">See requests from prospective students</p>
        </article>
        <article className="rounded-lg border border-[#b4e5e4] bg-[#f4fcfc] px-4 py-4">
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Update profile</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">Go to your active students</p>
        </article>
      </div>
    </div>
  );
}

function TutorOverviewSection() {
  const overview = [
    { label: "Total tutor request", value: 8 },
    { label: "Total subjects", value: 4 },
    { label: "Resources created", value: 2 },
    { label: "Completion rate", value: "2%" },
    { label: "Active Students", value: 8 },
    { label: "Taught students", value: 4 },
  ];

  return (
    <div>
      <h2 className="mb-2 text-[0.93rem] font-semibold text-[#616a82]">Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {overview.map((item) => (
          <article key={item.label} className="rounded-lg border border-[#e4e8f1] bg-white px-4 py-4">
            <p className="text-[0.9rem] text-[#747d94]">{item.label}</p>
            <p className="mt-1 text-[2rem] font-bold leading-none text-[#1f2537]">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TutorDashboardPage() {
  return (
    <section className="mx-auto w-[min(calc(100%-(var(--app-gutter)*2)),var(--app-max-width))] space-y-7 py-6">
      <TutorActionsSection />
      <TutorOverviewSection />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardBookingsSection />
        <DashboardMessagesSection />
      </div>

      <DashboardResourcesSection />
    </section>
  );
}

