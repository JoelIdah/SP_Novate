import { redirect } from "next/navigation";
import NewDashboardPage from "../../components/dashboard/NewDashboardPage";
import { DIRECT_ONBOARDING_ENABLED } from "../../config/featureFlags";

export default function DashboardPage() {
  if (!DIRECT_ONBOARDING_ENABLED) {
    redirect("/coming-soon");
  }

  return <NewDashboardPage />;
}

