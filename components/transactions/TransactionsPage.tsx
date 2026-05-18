import { DashboardNavbar } from "../dashboard/DashboardNavbar";

export default function TransactionsPage() {
  return (
    <main className="dashboard-screen bg-[#f6f7fb] text-[#2b3245]">
      <div className="dashboard-shell">
        <DashboardNavbar active="Transactions" />
        <section className="dashboard-main">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <div className="w-full py-[1.2em]">
              <div className="rounded-[1em] border border-[#e6e9f2] bg-white p-[1.2em]">
                <h1 className="text-[1.05em] font-semibold text-[#2f3547]">Transactions</h1>
                <p className="mt-[0.55em] text-[0.86em] text-[#7c8498]">
                  Your transaction history and wallet activity will appear here.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

