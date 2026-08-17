import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { getAdminTools } from "@/lib/db/queries/admin-tools";
import { listAdminAudit, redactAdminDetails } from "@/lib/db/queries/admin-audit";
import { SweepPanel } from "@/components/admin/sweep-panel";
import { ClientTime } from "@/components/shared/client-time";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function stateClass(state: string) { return state === "Healthy" ? "text-success" : state === "Unavailable" ? "text-error" : state === "Warning" ? "text-warning" : "text-text-muted"; }

export default async function AdminToolsPage() {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const [{ health }, audit] = await Promise.all([getAdminTools(), listAdminAudit({ limit: 8 })]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Tools</h1><p className="mt-1 text-sm text-text-secondary">System health and treasury operations</p></div>
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">System health</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {health.map((item) => (
            <div key={item.name} className="rounded-md border border-border-subtle bg-surface-2 p-3">
              <p className="text-xs text-text-muted">{item.name}</p>
              <p className={`mt-2 text-sm font-medium ${stateClass(item.state)}`}>{item.state}</p>
              {item.detail && <p className="mt-1 text-xs text-text-muted">{item.detail}</p>}
            </div>
          ))}
        </div>
      </section>
      <SweepPanel />
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 font-semibold text-text-primary">Recent operational activity</h2>
        {audit.length === 0 ? <p className="text-sm text-text-muted">No data to display.</p> : (
          <ul className="space-y-2">
            {audit.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2 text-sm">
                <span className="text-text-primary">{entry.action}</span>
                <span className="text-xs text-text-muted"><ClientTime utc={entry.createdAt} /> · {entry.status} · {entry.adminEmail}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <details className="rounded-lg border border-border-default bg-surface p-6 text-sm">
        <summary className="cursor-pointer font-semibold text-text-primary">Last audit entry details (redacted)</summary>
        {audit.length === 0 ? <p className="mt-3 text-text-muted">No audit entries.</p> : (
          <pre className="mt-3 overflow-x-auto rounded-md bg-surface-2 p-3 text-xs text-text-secondary">{JSON.stringify(redactAdminDetails(audit[0]!.details), null, 2)}</pre>
        )}
      </details>
    </div>
  );
}
