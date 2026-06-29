"use client";

import { StudentDashboardNavbar } from "./StudentDashboardNavbar";
import {
  StudentDashboardActionsSection,
  StudentDashboardBookingsSection,
  StudentDashboardLearningOverviewSection,
  StudentDashboardMessagesSection,
  StudentDashboardResourcesSection,
} from "./StudentDashboardSections";

export default function StudentDashboardPage() {
  return (
    <div className="dashboard-screen dashboard-home-fit bg-white text-[#1E1E1E]">
      <div className="dashboard-shell">
        <StudentDashboardNavbar active="Home" />

        <main className="dashboard-main overflow-y-auto overflow-x-hidden scrollbar-hover">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <div
              className="dashboard-stack gap-3 2xl:gap-4"
              data-dashboard-content
            >
              <section>
                <StudentDashboardActionsSection />
              </section>

              <section>
                <StudentDashboardLearningOverviewSection />
              </section>

              <section>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr] xl:items-stretch">
                  <div className="h-full min-h-0">
                    <StudentDashboardBookingsSection />
                  </div>
                  <div className="h-full min-h-0">
                    <StudentDashboardMessagesSection />
                  </div>
                </div>

              </section>

              <section>
                <StudentDashboardResourcesSection />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

