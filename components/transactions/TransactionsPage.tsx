import { DashboardNavbar } from "../dashboard/DashboardNavbar";

export default function TransactionsPage() {
  return (
    <main className="min-h-dvh bg-[#f6f7fb] text-[#2b3245]">
      <DashboardNavbar active="Transactions" />

      <section className="mx-auto w-[min(calc(100%-(var(--app-gutter)*2)),var(--app-max-width))] py-8">
        <div className="rounded-2xl border border-[#e6e9f2] bg-white p-6">
          <h1 className="text-[1.05rem] font-semibold text-[#2f3547]">Transactions</h1>
          <p className="mt-2 text-[0.86rem] text-[#7c8498]">
            Your transaction history and wallet activity will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}
