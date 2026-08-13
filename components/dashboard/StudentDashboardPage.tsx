"use client";

import { StudentDashboardNavbar } from "./StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import {
  StudentDashboardActionsSection,
  StudentDashboardBookingsSection,
  StudentDashboardLearningOverviewSection,
  StudentDashboardMessagesSection,
  StudentDashboardResourcesSection,
} from "./StudentDashboardSections";

export default function StudentDashboardPage() {
  return (
    <DashboardShell homeFit navbar={<StudentDashboardNavbar active="Home" />}>
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
    </DashboardShell>
  );
}

