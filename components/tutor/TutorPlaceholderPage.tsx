import Link from "next/link";
import { TutorNavbar } from "./TutorNavbar";

type TutorNavLabel = "Home" | "Bookings" | "Transactions" | "Resources" | "Chat";

export default function TutorPlaceholderPage({
  active,
  title,
  description,
}: {
  active: TutorNavLabel;
  title: string;
  description: string;
}) {
  return (
    <div className="dashboard-screen bg-white text-[#1E1E1E]">
      <div className="dashboard-shell">
        <TutorNavbar active={active} />
        <main className="dashboard-main">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <section className="w-full py-6">
              <div className="mx-auto max-w-[42rem] rounded-2xl border border-[#e4e8f1] bg-[#fafbff] p-6 text-center">
                <h1 className="text-[1.45rem] font-semibold text-[#2f3547]">{title}</h1>
                <p className="mt-2 text-[0.92rem] text-[#69728b]">{description}</p>
                <Link
                  className="mt-4 inline-flex rounded-full bg-[#262563] px-4 py-2 text-[0.8rem] font-semibold text-white"
                  href="/tutor/dashboard"
                >
                  Back to tutor dashboard
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

