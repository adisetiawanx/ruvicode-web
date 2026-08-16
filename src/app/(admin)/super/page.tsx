import { getAdminOverview } from "@/lib/db/queries/admin-overview";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { SweepPanel } from "@/components/admin/sweep-panel";

export const dynamic = "force-dynamic";
function admin(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }

export default async function SuperOverviewPage() {
  const session = await getSession(); if (!session || !admin(session.user.email)) return notFound();
  const data = await getAdminOverview();
  const chart = data.ops.volume7d.map((day) => ({ date: day.date, isoDate: day.isoDate, cost: day.cost, requests: day.count }));
  const alerts = [
    data.chain.ratio !== null && data.chain.ratio < 1 ? "Reserve ratio is below 1" : null,
    data.chain.available && data.chain.treasuryEth < 0.005 ? "Treasury ETH is low" : null,
    data.chain.available === false ? data.chain.error ?? "Chain data unavailable" : null,
  ].filter(Boolean).slice(0, 5) as string[];
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold text-text-primary">Admin Overview</h1><p className="mt-1 text-sm text-text-secondary">A concise view of product health</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Users" value={data.users.total.toLocaleString()} sublabel={`${data.users.active7d.toLocaleString()} active in 7 days`} /><StatCard label="Charges" value={usd(data.revenue.chargesToday)} sublabel="Today" /><StatCard label="Margin" value={usd(data.revenue.today)} sublabel={`${data.revenue.marginPct.toFixed(1)}% today`} /><StatCard label="Reserve" value={data.chain.ratio === null ? "Unavailable" : `${data.chain.ratio.toFixed(2)}×`} sublabel={data.chain.ratio === null ? "Chain unavailable" : data.chain.ratio >= 1 ? "Healthy" : "Under-reserved"} accent={data.chain.ratio !== null && data.chain.ratio >= 1} /></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><UsageChart data={chart} /><div className="rounded-lg border border-border-default bg-surface p-6"><h2 className="mb-4 font-semibold text-text-primary">System health</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{["Gateway", "Database", "Redis", "Pricing sync", "Deposit monitor", "Treasury gas"].map((name) => <div key={name} className="rounded-md border border-border-subtle bg-surface-2 p-3"><p className="text-xs text-text-muted">{name}</p><p className="mt-2 text-sm text-success">Healthy</p></div>)}</div></div></div><section className="rounded-lg border border-border-default bg-surface p-6"><h2 className="mb-3 font-semibold text-text-primary">Active alerts</h2>{alerts.length === 0 ? <p className="text-sm text-text-muted">No active issues detected.</p> : <ul className="space-y-2 text-sm text-warning">{alerts.map((alert) => <li key={alert}>• {alert}</li>)}</ul>}</section></div>;
}
