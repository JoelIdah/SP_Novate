"use client";

import { DashboardNavbar } from "./DashboardNavbar";
import {
  DashboardActionsSection,
  DashboardBookingsSection,
  DashboardLearningOverviewSection,
  DashboardMessagesSection,
  DashboardResourcesSection,
} from "./DashboardSections";

export default function NewDashboardPage() {
  return (
    <div className="dashboard-screen dashboard-home-fit bg-white text-[#1E1E1E]">
      <div className="dashboard-shell">
        <DashboardNavbar active="Home" />

        <main className="dashboard-main">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <div className="dashboard-stack gap-3 2xl:gap-4" data-dashboard-content>
              <section>
                <DashboardActionsSection />
              </section>

              <section>
                <DashboardLearningOverviewSection />
              </section>

              <section>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr] xl:items-stretch">
                  <div className="h-full min-h-0">
                    <DashboardBookingsSection />
                  </div>
                  <div className="h-full min-h-0">
                    <DashboardMessagesSection />
                  </div>
                </div>

              </section>

              <section>
                <DashboardResourcesSection />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

