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
    <main className="app-page-shell bg-[#f6f7fb] text-[#2d3448]">
      <DashboardNavbar />

      <section className="app-page-wrap space-y-7 py-6">
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
