import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { getAdminFinancial } from "@/lib/db/queries/admin-financial";
import { displayModelName } from "@/lib/models/display";
import { ClientTime } from "@/components/shared/client-time";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }

export default async function AdminFinancialPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const method = typeof params.method === "string" ? params.method : "";
  const status = typeof params.status === "string" ? params.status : "";
  const { revenue, deposits, chain } = await getAdminFinancial();
  const reserveValue = chain.ratio !== null ? `${chain.ratio.toFixed(2)}×` : chain.available ? "N/A" : "Unavailable";
  const reserveSub = chain.ratio !== null ? (chain.ratio >= 1 ? "Healthy" : "Under-reserved") : chain.available ? "No wallet liability yet" : "Chain data unavailable";
  const recent = deposits.recent.filter((row) => (!method || row.method === method) && (!status || row.status === status));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Financial</h1><p className="mt-1 text-sm text-text-secondary">Charges, liability, deposits, and model economics</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Charges today</p><p className="mt-1 font-mono text-xl">{usd(revenue.chargesToday)}</p></div>
        <div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Margin today</p><p className="mt-1 font-mono text-xl">{usd(revenue.today)}</p></div>
        <div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Liability</p><p className="mt-1 font-mono text-xl">${chain.liability.toFixed(2)}</p></div>
        <div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Reserve</p><p className="mt-1 font-mono text-xl">{reserveValue}</p><p className="mt-1 text-xs text-text-muted">{reserveSub}</p></div>
      </div>
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">Deposits</h2>
        <AdminFilterBar
          fields={[
            { name: "method", type: "select", label: "Method", options: [{ value: "usdc", label: "USDC" }, { value: "paddle", label: "Paddle" }] },
            { name: "status", type: "select", label: "Status", options: [{ value: "completed", label: "Completed" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }] },
          ]}
        />
        <p className="mb-4 mt-4 text-sm text-text-secondary">USDC {deposits.totalUsdc.toFixed(2)} · Paddle {deposits.totalPaddle.toFixed(2)} · {deposits.pending} pending · {deposits.failed} failed</p>
        <div className="overflow-x-auto">
          {recent.length === 0 ? <p className="text-sm text-text-muted">No data to display.</p> : (
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-xs text-text-muted"><tr><th className="pb-2 text-left">Time</th><th className="pb-2 text-left">Method</th><th className="pb-2 text-right">Amount</th><th className="pb-2 text-left">Status</th></tr></thead>
              <tbody>
                {recent.map((row, i) => (
                  <tr key={`${row.createdAt}-${i}`} className="border-t border-border-subtle">
                    <td className="py-2 text-xs"><ClientTime utc={row.createdAt} /></td>
                    <td className="py-2">{row.method}</td>
                    <td className="py-2 text-right font-mono">${row.amount.toFixed(2)}</td>
                    <td className="py-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">Model profitability</h2>
        {revenue.perModel.length === 0 ? <p className="text-sm text-text-muted">No data to display.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted"><tr><th className="px-3 py-2 text-left">Model</th><th className="px-3 py-2 text-right">Requests</th><th className="px-3 py-2 text-right">Charges</th><th className="px-3 py-2 text-right">Provider cost</th><th className="px-3 py-2 text-right">Margin</th><th className="px-3 py-2 text-right">%</th></tr></thead>
              <tbody>
                {revenue.perModel.map((row) => (
                  <tr key={row.model} className="border-b border-border-subtle">
                    <td className="px-3 py-2">{displayModelName(row.model)}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.requests}</td>
                    <td className="px-3 py-2 text-right font-mono">{usd(row.userCost)}</td>
                    <td className="px-3 py-2 text-right font-mono">{usd(row.upstreamCost)}</td>
                    <td className={`px-3 py-2 text-right font-mono ${row.margin < 0 ? "text-error" : ""}`}>{usd(row.margin)}</td>
                    <td className="px-3 py-2 text-right font-mono">{row.marginPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
