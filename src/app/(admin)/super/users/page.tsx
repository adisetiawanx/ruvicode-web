import Link from "next/link";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { listAdminUsers } from "@/lib/db/queries/admin-users";
import { ClientTime } from "@/components/shared/client-time";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { CopyAddress } from "@/components/admin/copy-address";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }
function qs(base: string, page: number, search?: string) { const params = new URLSearchParams(); params.set("page", String(page)); if (search) params.set("search", search); return `${base}?${params.toString()}`; }

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession(); if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const search = typeof params.search === "string" ? params.search : undefined;
  const data = await listAdminUsers({ page, search });
  const start = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const end = Math.min(data.page * data.pageSize, data.total);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Users</h1><p className="mt-1 text-sm text-text-secondary">Accounts, balances, activity, and usage</p></div>
      <AdminFilterBar fields={[{ name: "search", type: "search", label: "Name or email", placeholder: "Search name or email" }]} />
      <section className="rounded-lg border border-border-default bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="bg-surface-2 text-xs text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">User</th>
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">Created</th>
                <th className="px-3 py-2 text-right font-medium">Keys</th>
                <th className="px-3 py-2 text-right font-medium">Requests</th>
                <th className="px-3 py-2 text-right font-medium">Charges</th>
                <th className="px-3 py-2 text-right font-medium">Wallet</th>
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">Deposits</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-text-muted">No data to display.</td></tr>
              ) : data.rows.map((row) => (
                <tr key={row.id} className="border-b border-border-subtle last:border-0">
                  <td className="max-w-[220px] px-3 py-3"><Link href={`/super/users/${row.id}`} className="block truncate text-accent-text hover:text-accent-hover">{row.name || row.email}</Link><p className="truncate text-xs text-text-muted">{row.email}</p></td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted"><ClientTime utc={row.createdAt} format="date" /></td>
                  <td className="px-3 py-3 text-right font-mono">{row.apiKeys}</td>
                  <td className="px-3 py-3 text-right font-mono">{row.requests.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-mono">{usd(row.charges)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono tabular">
                    <span className="text-text-primary">${row.balance.toFixed(2)}</span>
                    {row.depositAddress && <CopyAddress address={row.depositAddress} />}
                    {row.held > 0 && <span className="block text-xs text-text-muted">{row.held.toFixed(2)} held</span>}
                    <span className="block text-xs text-text-muted">{row.totalLoaded.toFixed(2)} loaded · {row.totalSpent.toFixed(2)} spent</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs"><span className="text-success">{row.completedDeposits} completed</span>{row.pendingDeposits > 0 && <span className="ml-1 text-warning">· {row.pendingDeposits} pending</span>}{row.failedDeposits > 0 && <span className="ml-1 text-error">· {row.failedDeposits} failed</span>}<span className="block text-text-muted">{row.depositAddresses} address</span></td>
                  <td className="px-3 py-3 text-xs text-success">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3 text-sm text-text-muted">
          <span>{data.total.toLocaleString()} users{data.total > 0 ? ` · ${start}–${end}` : ""}</span>
          <div className="flex gap-3">{data.page > 1 && <Link className="text-accent-text" href={qs("/super/users", data.page - 1, search)}>Previous</Link>}{data.page < data.totalPages && <Link className="text-accent-text" href={qs("/super/users", data.page + 1, search)}>Next</Link>}</div>
        </div>
      </section>
    </div>
  );
}
