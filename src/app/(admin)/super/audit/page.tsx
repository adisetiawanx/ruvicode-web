import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { listAdminAudit, redactAdminDetails } from "@/lib/db/queries/admin-audit";
import { ClientTime } from "@/components/shared/client-time";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const action = typeof params.action === "string" ? params.action : "";
  const status = typeof params.status === "string" ? params.status : "";
  const entries = await listAdminAudit({ limit: 100 });
  const filtered = entries.filter((entry) => (!action || entry.action.includes(action)) && (!status || entry.status === status));
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filtered.length);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Audit Log</h1><p className="mt-1 text-sm text-text-secondary">Administrative and financial operation history</p></div>
      <AdminFilterBar
        fields={[
          { name: "action", type: "search", label: "Action", placeholder: "Filter by action" },
          { name: "status", type: "select", label: "Status", options: [{ value: "success", label: "Success" }, { value: "failed", label: "Failed" }, { value: "pending", label: "Pending" }] },
        ]}
      />
      <section className="overflow-hidden rounded-lg border border-border-default bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-surface-2 text-xs text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Admin</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Operation</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-text-muted">No data to display.</td></tr>
              ) : pageRows.map((entry) => (
                <tr key={entry.id} className="border-b border-border-subtle last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted"><ClientTime utc={entry.createdAt} /></td>
                  <td className="px-3 py-3 text-xs">{entry.adminEmail}</td>
                  <td className="px-3 py-3">{entry.action}</td>
                  <td className="px-3 py-3 text-xs text-text-muted">{entry.operationId ?? "-"}</td>
                  <td className="px-3 py-3 text-xs"><span className={entry.status === "success" ? "text-success" : entry.status === "failed" ? "text-error" : "text-warning"}>{entry.status}</span></td>
                  <td className="px-3 py-3 text-xs text-text-muted">{Object.keys(entry.details).length > 0 ? `${Object.keys(entry.details).length} fields` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
          <span>{filtered.length.toLocaleString()} entries{filtered.length > 0 ? ` · ${start}–${end}` : ""}</span>
          <div className="flex gap-3">
            {page > 1 && <Link className="text-accent-text" href={`/super/audit?${new URLSearchParams({ page: String(page - 1), ...(action ? { action } : {}), ...(status ? { status } : {}) }).toString()}`}>Previous</Link>}
            {page < totalPages && <Link className="text-accent-text" href={`/super/audit?${new URLSearchParams({ page: String(page + 1), ...(action ? { action } : {}), ...(status ? { status } : {}) }).toString()}`}>Next</Link>}
          </div>
        </div>
      </section>
      {filtered.length > 0 && (
        <details className="rounded-lg border border-border-default bg-surface p-6 text-sm">
          <summary className="cursor-pointer font-semibold text-text-primary">Last audit entry details (redacted)</summary>
          <pre className="mt-3 overflow-x-auto rounded-md bg-surface-2 p-3 text-xs text-text-secondary">{JSON.stringify(redactAdminDetails(filtered[0]!.details), null, 2)}</pre>
        </details>
      )}
    </div>
  );
}
