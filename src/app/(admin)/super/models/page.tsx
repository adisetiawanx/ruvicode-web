import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { getAdminModels } from "@/lib/db/queries/admin-models";
import { displayModelName } from "@/lib/models/display";
import { ClientTime } from "@/components/shared/client-time";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }

export default async function AdminModelsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = typeof params.search === "string" ? params.search.toLowerCase() : "";
  const active = typeof params.active === "string" ? params.active : "";
  const all = await getAdminModels();
  const filtered = all.filter((row) =>
    (!search || row.model.toLowerCase().includes(search) || (row.displayName ?? "").toLowerCase().includes(search))
    && (!active || (active === "active" ? row.active : !row.active)),
  );
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filtered.length);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Models</h1><p className="mt-1 text-sm text-text-secondary">Catalog status and model economics</p></div>
      <AdminFilterBar
        fields={[
          { name: "search", type: "search", label: "Model or display name", placeholder: "Search model or display name" },
          { name: "active", type: "select", label: "State", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
        ]}
      />
      <section className="overflow-hidden rounded-lg border border-border-default bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-surface-2 text-xs text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Model</th>
                <th className="px-3 py-2 text-left">State</th>
                <th className="px-3 py-2 text-right">User input</th>
                <th className="px-3 py-2 text-right">User output</th>
                <th className="px-3 py-2 text-right">Ref input</th>
                <th className="px-3 py-2 text-right">Ref output</th>
                <th className="px-3 py-2 text-right">Discount</th>
                <th className="px-3 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-text-muted">No data to display.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.model} className="border-b border-border-subtle last:border-0">
                  <td className="px-3 py-3"><Link href={`/models/${row.model}`} className="text-accent-text hover:text-accent-hover">{displayModelName(row.model)}</Link><p className="text-xs text-text-muted">{row.model}</p></td>
                  <td className="px-3 py-3 text-xs"><span className={row.active ? "text-success" : "text-text-muted"}>{row.active ? "Active" : "Inactive"}</span></td>
                  <td className="px-3 py-3 text-right font-mono">{usd(row.userInput)}</td>
                  <td className="px-3 py-3 text-right font-mono">{usd(row.userOutput)}</td>
                  <td className="px-3 py-3 text-right font-mono text-text-muted">{usd(row.refInput)}</td>
                  <td className="px-3 py-3 text-right font-mono text-text-muted">{usd(row.refOutput)}</td>
                  <td className="px-3 py-3 text-right font-mono">{row.refInput > 0 ? `${(((row.refInput - row.userInput) / row.refInput) * 100).toFixed(1)}%` : "-"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted"><ClientTime utc={row.updatedAt} format="date" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
          <span>{filtered.length.toLocaleString()} models{filtered.length > 0 ? ` · ${start}–${end}` : ""}</span>
          <div className="flex gap-3">
            {page > 1 && <Link className="text-accent-text" href={`/super/models?${new URLSearchParams({ page: String(page - 1), ...(search ? { search } : {}), ...(active ? { active } : {}) }).toString()}`}>Previous</Link>}
            {page < totalPages && <Link className="text-accent-text" href={`/super/models?${new URLSearchParams({ page: String(page + 1), ...(search ? { search } : {}), ...(active ? { active } : {}) }).toString()}`}>Next</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
