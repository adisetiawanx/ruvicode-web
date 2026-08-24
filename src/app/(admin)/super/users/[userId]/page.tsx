import Link from "next/link";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { getAdminUserDetail } from "@/lib/db/queries/admin-users";
import { ClientTime } from "@/components/shared/client-time";
import { AddTopupForm } from "@/components/admin/add-topup-form";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).includes(email.toLowerCase()); }
export default async function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) { const session = await getSession(); if (!session || !ok(session.user.email)) return notFound(); const { userId } = await params; const data = await getAdminUserDetail(userId); if (!data) return notFound(); return <div className="space-y-6"><div><Link href="/super/users" className="text-sm text-accent-text">Users</Link><h1 className="mt-2 text-2xl font-semibold text-text-primary">{data.name || data.email}</h1><p className="text-sm text-text-secondary">{data.email}</p></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Balance</p><p className="mt-1 font-mono text-xl">${data.balance.toFixed(2)}</p></div><div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Held</p><p className="mt-1 font-mono text-xl">${data.held.toFixed(2)}</p></div><div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Total loaded</p><p className="mt-1 font-mono text-xl">${data.totalLoaded.toFixed(2)}</p></div><div className="rounded-lg border border-border-default bg-surface p-4"><p className="text-xs text-text-muted">Total spent</p><p className="mt-1 font-mono text-xl">${data.totalSpent.toFixed(2)}</p></div></div><section className="rounded-lg border border-border-default bg-surface p-6">
      <h2 className="mb-1 font-semibold">Add wallet credit</h2>
      <p className="mb-4 text-sm text-text-secondary">Manual credit for IDR transfers, failed deposits, or corrections. Amount is always USD.</p>
      <AddTopupForm userId={data.id} balance={data.balance} />
    </section>
    <section className="rounded-lg border border-border-default bg-surface p-6"><h2 className="mb-4 font-semibold">API keys</h2>{data.keys.length === 0 ? <p className="text-sm text-text-muted">No API keys.</p> : (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-sm">
      <thead className="border-b border-border-default text-xs uppercase tracking-wider text-text-muted">
        <tr>
          <th className="px-3 py-2.5 text-left font-medium">Label</th>
          <th className="px-3 py-2.5 text-left font-medium">Key</th>
          <th className="px-3 py-2.5 text-right font-medium">RPM</th>
          <th className="px-3 py-2.5 text-right font-medium">Daily limit</th>
          <th className="px-3 py-2.5 text-right font-medium">Monthly limit</th>
          <th className="px-3 py-2.5 text-left font-medium">Last used</th>
          <th className="px-3 py-2.5 text-left font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.keys.map((key) => (
          <tr key={key.id} className="border-b border-border-subtle last:border-0">
            <td className="px-3 py-2.5">{key.label}</td>
            <td className="px-3 py-2.5 font-mono text-xs text-text-muted">rvcd_{key.prefix}…</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{key.rpm}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{key.daily ? `$${key.daily}` : "-"}</td>
            <td className="px-3 py-2.5 text-right font-mono text-xs">{key.monthly ? `$${key.monthly}` : "-"}</td>
            <td className="whitespace-nowrap px-3 py-2.5 text-xs text-text-muted">{key.lastUsed ? <ClientTime utc={key.lastUsed} /> : "Never"}</td>
            <td className="px-3 py-2.5 text-xs"><span className={key.active ? "text-success" : "text-text-muted"}>{key.active ? "Active" : "Revoked"}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}</section><section className="rounded-lg border border-border-default bg-surface p-6"><h2 className="mb-4 font-semibold">Recent usage</h2>{data.usage.length === 0 ? <p className="py-8 text-center text-sm text-text-muted">No data to display.</p> : (<div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="border-b border-border-default text-xs uppercase tracking-wider text-text-muted"><tr><th className="px-3 py-2.5 text-left font-medium">Time</th><th className="px-3 py-2.5 text-left font-medium">Model</th><th className="px-3 py-2.5 text-right font-medium">Tokens</th><th className="px-3 py-2.5 text-right font-medium">Cached</th><th className="px-3 py-2.5 text-right font-medium">Cost</th><th className="px-3 py-2.5 text-left font-medium">Status</th></tr></thead><tbody>{data.usage.map((row) => <tr key={row.id} className="border-b border-border-subtle last:border-0"><td className="whitespace-nowrap px-3 py-2.5 text-xs text-text-muted"><ClientTime utc={row.createdAt} /></td><td className="px-3 py-2.5">{row.model}</td><td className="px-3 py-2.5 text-right font-mono text-xs"><span className="block">{row.promptTokens.toLocaleString()} in</span><span className="block text-text-muted">{row.completionTokens.toLocaleString()} out</span></td><td className="px-3 py-2.5 text-right font-mono text-xs text-text-muted">{(row.cacheReadTokens ?? 0) > 0 ? <>{(row.cacheReadTokens ?? 0).toLocaleString()} <span className="text-text-muted">({row.promptTokens > 0 ? ((row.cacheReadTokens ?? 0) / Math.max(row.promptTokens, 1) * 100).toFixed(1) : 0}%)</span></> : "0 (0%)"}</td><td className="px-3 py-2.5 text-right font-mono">${row.cost.toFixed(6)}</td><td className="px-3 py-2.5 text-xs"><span className={row.status === "completed" ? "text-success" : row.status === "failed" ? "text-error" : "text-warning"}>{row.status}</span></td></tr>)}</tbody></table></div>)}</section></div>; }
