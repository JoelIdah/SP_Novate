import { DashboardNavbar } from "./DashboardNavbar";
import {
  DashboardActionsSection,
  DashboardBookingsSection,
  DashboardLearningOverviewSection,
  DashboardMessagesSection,
  DashboardResourcesSection,
} from "./DashboardSections";

export function StudentDashboardPage() {
  return (
    <main className="min-h-dvh bg-[#f6f7fb] text-[#2d3448]">
      <DashboardNavbar />

      <section className="mx-auto w-[min(calc(100%-(var(--app-gutter)*2)),var(--app-max-width))] space-y-7 py-6">
        <DashboardActionsSection />
        <DashboardLearningOverviewSection />

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardBookingsSection />
          <DashboardMessagesSection />
        </div>

        <DashboardResourcesSection />
      </section>
    </main>
  );
}
