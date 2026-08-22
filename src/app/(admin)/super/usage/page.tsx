import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { getAdminUsage } from "@/lib/db/queries/admin-usage";
import { ClientTime } from "@/components/shared/client-time";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }

export default async function AdminUsagePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = typeof params.search === "string" ? params.search.toLowerCase() : "";
  const model = typeof params.model === "string" ? params.model : "";
  const status = typeof params.status === "string" ? params.status : "";
  const data = await getAdminUsage();
  const filtered = data.rows.filter((row) =>
    (!search || row.model.toLowerCase().includes(search) || (row.keyLabel ?? "").toLowerCase().includes(search) || (row.requestId ?? "").toLowerCase().includes(search))
    && (!model || row.model === model)
    && (!status || row.status === status),
  );
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filtered.length);
  const totalTokens = filtered.reduce(
    (acc, r) => acc + r.promptTokens + r.completionTokens,
    0,
  );
  const totalCached = filtered.reduce(
    (acc, r) => acc + (r.cacheReadTokens ?? 0),
    0,
  );
  const cachePct =
    totalTokens > 0 ? Math.round((totalCached / totalTokens) * 100) : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Usage</h1><p className="mt-1 text-sm text-text-secondary">Request traffic and metadata-only usage records</p></div>
      <AdminFilterBar
        fields={[
          { name: "search", type: "search", label: "Model, key, request ID", placeholder: "Search model, key, request ID" },
          { name: "model", type: "select", label: "Model", options: data.models.map((m) => ({ value: m.model, label: m.model })) },
          { name: "status", type: "select", label: "Status", options: [{ value: "completed", label: "Completed" }, { value: "failed", label: "Failed" }, { value: "partial", label: "Partial" }] },
        ]}
      />
      <section className="overflow-hidden rounded-lg border border-border-default bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-surface-2 text-xs text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-left">Key</th>
                <th className="px-3 py-2 text-right">Tokens</th>
                <th className="px-3 py-2 text-right">Cached</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Request ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-text-muted">No data to display.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted"><ClientTime utc={row.createdAt} /></td>
                  <td className="px-3 py-3">{row.model}</td>
                  <td className="px-3 py-3 text-xs text-text-muted">{row.keyLabel ?? "Deleted key"}</td>
                  <td className="px-3 py-3 text-right font-mono text-xs">{(row.promptTokens + row.completionTokens).toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-mono text-xs text-text-muted">{(row.cacheReadTokens ?? 0) > 0 ? row.cacheReadTokens.toLocaleString() : "-"}</td>
                  <td className="px-3 py-3 text-right font-mono">{usd(row.cost)}</td>
                  <td className="px-3 py-3 text-xs"><span className={row.status === "completed" ? "text-success" : row.status === "failed" ? "text-error" : "text-warning"}>{row.status}</span></td>
                  <td className="px-3 py-3 text-xs text-text-muted">{row.requestId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
          <span>
            {filtered.length.toLocaleString()} records{filtered.length > 0 ? ` · ${start}–${end}` : ""}
            {totalCached > 0 ? ` · ${totalTokens.toLocaleString()} tokens · ${totalCached.toLocaleString()} cached (${cachePct}%)` : ""}
          </span>
          <div className="flex gap-3">
            {page > 1 && <Link className="text-accent-text" href={`/super/usage?${new URLSearchParams({ page: String(page - 1), ...(search ? { search } : {}), ...(model ? { model } : {}), ...(status ? { status } : {}) }).toString()}`}>Previous</Link>}
            {page < totalPages && <Link className="text-accent-text" href={`/super/usage?${new URLSearchParams({ page: String(page + 1), ...(search ? { search } : {}), ...(model ? { model } : {}), ...(status ? { status } : {}) }).toString()}`}>Next</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
