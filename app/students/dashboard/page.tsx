import { redirect } from "next/navigation";
import StudentDashboardPage from "../../../components/dashboard/StudentDashboardPage";
import { DIRECT_ONBOARDING_ENABLED } from "../../../config/featureFlags";

export default function StudentsDashboardPage() {
  if (!DIRECT_ONBOARDING_ENABLED) {
    redirect("/coming-soon");
  }

  return <StudentDashboardPage />;
}
