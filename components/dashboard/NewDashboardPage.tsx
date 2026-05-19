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
    <div className="dashboard-screen bg-white text-[#1E1E1E]">
      <div className="dashboard-shell">
        <DashboardNavbar active="Home" />

        <main className="dashboard-main">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <div className="dashboard-stack" data-dashboard-content>
              <section>
                <DashboardActionsSection />
              </section>

              <section>
                <DashboardLearningOverviewSection />
              </section>

              <section className="dashboard-section-fill h-[16.5em] xl:h-[17.5em]">
                <div className="dashboard-section-fill-grid grid h-full grid-cols-1 gap-[0.95em] lg:grid-cols-2">
                  <div className="dashboard-section-fill-card">
                    <DashboardBookingsSection />
                  </div>
                  <div className="dashboard-section-fill-card">
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
