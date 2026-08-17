import Link from "next/link";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { listAdminUsers } from "@/lib/db/queries/admin-users";
import { ClientTime } from "@/components/shared/client-time";

export const dynamic = "force-dynamic";
function ok(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).includes(email.toLowerCase()); }
function usd(n: number) { return `$${n.toFixed(4)}`; }

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  if (!session || !ok(session.user.email)) return notFound();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const search = typeof params.search === "string" ? params.search : undefined;
  const data = await listAdminUsers({ page, search });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-text-primary">Users</h1><p className="mt-1 text-sm text-text-secondary">Accounts, balances, activity, and usage</p></div>
      <form className="flex gap-2"><input name="search" defaultValue={search} placeholder="Search name or email" className="h-8 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm" /><button className="rounded-lg bg-accent px-3 text-sm text-text-inverse">Search</button></form>
      <section className="rounded-lg border border-border-default bg-surface">
        <div className="overflow-x-auto"><table className="w-full min-w-[1120px] table-fixed text-sm"><colgroup><col className="w-[25%]"/><col className="w-[10%]"/><col className="w-[7%]"/><col className="w-[9%]"/><col className="w-[10%]"/><col className="w-[10%]"/><col className="w-[9%]"/><col className="w-[20%]"/></colgroup><thead className="bg-surface-2 text-xs text-text-muted"><tr>{["User", "Created", "Keys", "Requests", "Charges", "Balance", "Held", "Deposits", "Status"].map((x) => <th key={x} className="whitespace-nowrap px-3 py-2 text-left">{x}</th>)}</tr></thead><tbody>{data.rows.length === 0 ? <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-text-muted">Belum ada data yang ditampilkan.</td></tr> : data.rows.map((row) => <tr key={row.id} className="border-b border-border-subtle last:border-0"><td className="truncate px-3 py-3"><Link href={`/super/users/${row.id}`} className="text-accent-text hover:text-accent-hover">{row.name || row.email}</Link><p className="truncate text-xs text-text-muted">{row.email}</p></td><td className="whitespace-nowrap px-3 py-3 text-xs text-text-muted"><ClientTime utc={row.createdAt} format="date" /></td><td className="px-3 py-3 font-mono">{row.apiKeys}</td><td className="px-3 py-3 font-mono">{row.requests}</td><td className="px-3 py-3 font-mono">{usd(row.charges)}</td><td className="px-3 py-3 font-mono">${row.balance.toFixed(2)}</td><td className="px-3 py-3 font-mono">${row.held.toFixed(2)}</td><td className="px-3 py-3 text-xs"><span className="text-success">{row.completedDeposits} completed</span>{row.pendingDeposits > 0 && <span className="ml-1 text-warning">· {row.pendingDeposits} pending</span>}{row.failedDeposits > 0 && <span className="ml-1 text-error">· {row.failedDeposits} failed</span>}<span className="block text-text-muted">{row.depositAddresses} address</span></td><td className="px-3 py-3 text-success">{row.status}</td></tr>)}</tbody></table></div>
        <div className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-sm text-text-muted"><span>{data.total.toLocaleString()} users</span><div className="flex gap-2">{data.page > 1 && <Link className="text-accent-text" href={`/super/users?page=${data.page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>Previous</Link>}{data.page < data.totalPages && <Link className="text-accent-text" href={`/super/users?page=${data.page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>Next</Link>}</div></div>
      </section>
    </div>
  );
}
