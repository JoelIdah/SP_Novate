"use client";

import { DashboardNavbar } from "../layout/DashboardNavbar";

type TutorNavLabel = "Home" | "Bookings" | "Transactions" | "Resources" | "Chat" | "Settings";

export function TutorNavbar({ active = "Home" }: { active?: TutorNavLabel }) {
  return <DashboardNavbar active={active} role="tutor" />;
}
