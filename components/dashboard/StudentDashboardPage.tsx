"use client";

import { useEffect, useState } from "react";

import { StudentDashboardNavbar } from "./StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import {
  StudentDashboardActionsSection,
  StudentDashboardBookingsSection,
  StudentDashboardLearningOverviewSection,
  StudentDashboardMessagesSection,
  StudentDashboardResourcesSection,
} from "./StudentDashboardSections";
import { getStudentDashboardStats, type StudentDashboardStats } from "./studentDashboard";
import { getBookings, type BookingListItem } from "../bookings/bookings";

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [bookingsError, setBookingsError] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getStudentDashboardStats(controller.signal)
      .then((data) => {
        setStats(data);
        setStatsError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatsError(error instanceof Error ? error.message : "The dashboard could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getBookings({ page: 1, pageSize: 3 }, controller.signal)
      .then((result) => {
        setBookings(result.data);
        setBookingsError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBookings([]);
        setBookingsError(error instanceof Error ? error.message : "Bookings could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookingsLoading(false);
      });
    return () => controller.abort();
  }, [bookingsRefreshKey]);

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
                <StudentDashboardLearningOverviewSection error={statsError} stats={stats} />
              </section>

              <section>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.45fr_1fr] xl:items-stretch">
                  <div className="h-full min-h-0">
                    <StudentDashboardBookingsSection
                      bookings={bookings}
                      error={bookingsError}
                      loading={bookingsLoading}
                      onRetry={() => {
                        setBookingsLoading(true);
                        setBookingsError("");
                        setBookingsRefreshKey((current) => current + 1);
                      }}
                    />
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

