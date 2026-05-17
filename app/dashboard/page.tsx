import { redirect } from "next/navigation";
import NewDashboardPage from "../../components/dashboard/NewDashboardPage";

export default function DashboardPage() {
  if (process.env.NEXT_PUBLIC_DISABLE_NOVATE_DIRECT_ONBOARDING === "true") {
    redirect("/coming-soon");
  }

  return <NewDashboardPage />;
}
