"use client";

import { DashboardNavbar } from "../layout/DashboardNavbar";

type StudentNavLabel = "Home" | "Bookings" | "Transactions" | "Chat";

export function StudentDashboardNavbar({ active = "Home" }: { active?: StudentNavLabel }) {
  return <DashboardNavbar active={active} role="student" />;
}
