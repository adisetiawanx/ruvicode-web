import { getAdminOverview } from "@/lib/db/queries/admin-overview";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminRequestsChart, AdminChargesChart } from "@/components/admin/admin-usage-charts";
import { ClientTime } from "@/components/shared/client-time";

export const dynamic = "force-dynamic";
function admin(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }
function stateClass(state: string) { return state === "Healthy" ? "text-success" : state === "Unavailable" ? "text-error" : state === "Warning" ? "text-warning" : "text-text-muted"; }

export default async function SuperOverviewPage() {
  const session = await getSession(); if (!session || !admin(session.user.email)) return notFound();
  const data = await getAdminOverview();
  const alerts = [
    data.revenue.perModel.find((row) => row.status === "negative") ? `Negative margin on ${data.revenue.perModel.find((row) => row.status === "negative")!.model}` : null,
    data.chain.ratio !== null && data.chain.ratio < 1 ? "Reserve ratio is below 1" : null,
    data.health.find((item) => item.name === "Pricing sync" && item.state === "Warning") ? "Pricing sync is stale" : null,
    data.health.find((item) => item.name === "Deposit monitor" && item.state === "Warning") ? "Deposit monitor has not scanned recently" : null,
    data.health.find((item) => item.name === "Treasury gas" && item.state === "Warning") ? "Treasury ETH is low" : null,
    data.health.some((item) => item.state === "Unavailable") ? "One or more services are unavailable" : null,
  ].filter(Boolean).slice(0, 5) as string[];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Overview</h1><p className="mt-1 text-sm text-text-secondary">Product health at a glance</p></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={data.users.total.toLocaleString()} sublabel={`${data.users.active7d.toLocaleString()} active in 7 days`} />
        <StatCard label="Charges" value={usd(data.revenue.chargesToday)} sublabel="Today" />
        <StatCard label="Margin" value={usd(data.revenue.today)} sublabel={`${data.revenue.marginPct.toFixed(1)}% today`} />
        <StatCard label="Reserve" value={data.chain.ratio === null ? "Unavailable" : `${data.chain.ratio.toFixed(2)}×`} sublabel={data.chain.ratio === null ? (data.chain.liability > 0 ? "Chain data unavailable" : "No wallet liability yet") : data.chain.ratio >= 1 ? "Healthy" : "Under-reserved"} accent={data.chain.ratio !== null && data.chain.ratio >= 1} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminRequestsChart data={data.ops.volume7d} />
        <AdminChargesChart data={data.ops.volume7d} />
      </div>
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">System health</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {data.health.map((item) => (
            <div key={item.name} className="rounded-md border border-border-subtle bg-surface-2 p-3">
              <p className="text-xs text-text-muted">{item.name}</p>
              <p className={`mt-2 text-sm font-medium ${stateClass(item.state)}`}>{item.state}</p>
              {item.detail && <p className="mt-1 text-xs text-text-muted">{item.detail}</p>}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-3 font-semibold text-text-primary">Active alerts</h2>
        {alerts.length === 0 ? <p className="text-sm text-text-muted">No active issues detected.</p> : (
          <ul className="space-y-2 text-sm text-warning">{alerts.map((alert) => <li key={alert} className="flex items-start gap-2"><span aria-hidden>•</span>{alert}</li>)}</ul>
        )}
      </section>
      <p className="text-xs text-text-muted">Overview generated <ClientTime utc={new Date().toISOString()} />.</p>
    </div>
  );
}
