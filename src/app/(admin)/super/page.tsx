import {
  getAdminUserStats,
  getAdminRevenue,
  getAdminDeposits,
  getAdminFloatVsLiability,
  getAdminOps,
} from "@/lib/db/queries/admin";
import { displayModelName } from "@/lib/models/display";
import { ClientTime } from "@/components/shared/client-time";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

/** Defense in depth: the layout already gates this, but the page
 *  re-verifies so a future refactor cannot silently drop the check. */
async function requireAdmin() {
  const session = await getSession();
  if (!session) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes((session.user.email ?? "").toLowerCase());
}

const RPC_URL = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
const USDC_CONTRACT =
  process.env.USDC_CONTRACT || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

function fmtUsd(n: number, digits = 2): string {
  return `$${n.toFixed(digits)}`;
}

export default async function SuperAdminPage() {
  if (!(await requireAdmin())) return notFound();

  const [users, revenue, deposits, floatData, ops] = await Promise.all([
    getAdminUserStats(),
    getAdminRevenue(),
    getAdminDeposits(),
    getAdminFloatVsLiability(RPC_URL, USDC_CONTRACT),
    getAdminOps(),
  ]);

  const healthyRatio = floatData.liability === 0 || floatData.ratio >= 1.0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent-text">
            Internal
          </p>
          <h1 className="text-2xl font-semibold text-text-primary">
            Admin Dashboard
          </h1>
        </div>
        <span className="rounded-full border border-border-subtle px-3 py-1 font-mono text-xs text-text-muted">
          noindex · private
        </span>
      </div>

      {/* ── Section: Float vs Liability (most critical) ── */}
      <section className="mb-8 rounded-xl border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Float vs Liability
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
            <p className="text-xs text-text-muted">On-chain float (USDC)</p>
            <p className="font-mono text-2xl font-semibold text-text-primary">
              {fmtUsd(floatData.float)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {floatData.addresses.length} deposit addresses
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
            <p className="text-xs text-text-muted">Liability (user balances)</p>
            <p className="font-mono text-2xl font-semibold text-text-primary">
              {fmtUsd(floatData.liability)}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              what users can spend
            </p>
          </div>
          <div
            className={`rounded-lg border p-4 ${
              healthyRatio
                ? "border-success/30 bg-success-subtle"
                : "border-error/30 bg-error-subtle"
            }`}
          >
            <p className="text-xs text-text-muted">Ratio (float ÷ liability)</p>
            <p
              className={`font-mono text-2xl font-semibold ${
                healthyRatio ? "text-success" : "text-error"
              }`}
            >
              {floatData.ratio.toFixed(2)}×
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {healthyRatio ? "healthy" : "under-reserved"}
            </p>
          </div>
        </div>
        {floatData.addresses.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-text-secondary">
              Per-address balances
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-border-subtle">
              <table className="w-full text-sm">
                <tbody>
                  {floatData.addresses.map((a) => (
                    <tr key={a.address} className="border-b border-border-subtle">
                      <td className="px-3 py-1.5 font-mono text-xs text-text-muted">
                        {a.address}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-xs text-text-secondary">
                        {fmtUsd(a.usdc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </section>

      {/* ── Section: Users + Revenue summary ── */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border-default bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Users</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Total registered</span>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {users.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Active (7d)</span>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {users.active7d}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-sm text-text-secondary">Signups (7d)</span>
              <span className="font-mono text-sm text-text-muted">
                {users.signups7d.map((s) => s.count).join(", ") || "none"}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border-default bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Gross Margin
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Today</span>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {fmtUsd(revenue.today, 4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">This week</span>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {fmtUsd(revenue.week, 4)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="text-sm text-text-secondary">This month</span>
              <span className="font-mono text-xl font-semibold text-text-primary">
                {fmtUsd(revenue.month, 4)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ── Section: Deposits ── */}
      <section className="mb-8 rounded-xl border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Deposits
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
            <p className="text-xs text-text-muted">Total USDC</p>
            <p className="font-mono text-xl font-semibold text-text-primary">
              {fmtUsd(deposits.totalUsdc)}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-4">
            <p className="text-xs text-text-muted">Total Paddle</p>
            <p className="font-mono text-xl font-semibold text-text-primary">
              {fmtUsd(deposits.totalPaddle)}
            </p>
          </div>
        </div>
        {deposits.recent.length > 0 ? (
          <div className="overflow-hidden rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">User</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Method</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {deposits.recent.map((d, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-3 py-2 font-mono text-xs text-text-muted">
                      {d.userId?.slice(0, 12) ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtUsd(d.amount)}
                    </td>
                    <td className="px-3 py-2">{d.method}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          d.status === "completed"
                            ? "text-success"
                            : "text-text-muted"
                        }
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-text-muted">
                      <ClientTime utc={d.createdAt} format="datetime" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No deposits yet.</p>
        )}
      </section>

      {/* ── Section: Per-model profitability ── */}
      <section className="mb-8 rounded-xl border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Per-Model Profitability
        </h2>
        {revenue.perModel.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Model</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                  <th className="px-3 py-2 text-right">User cost</th>
                  <th className="px-3 py-2 text-right">Upstream</th>
                  <th className="px-3 py-2 text-right">Margin</th>
                  <th className="px-3 py-2 text-right">%</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {revenue.perModel.map((m) => (
                  <tr key={m.model} className="border-b border-border-subtle">
                    <td className="px-3 py-2">{displayModelName(m.model)}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {m.requests.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtUsd(m.userCost, 4)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {fmtUsd(m.upstreamCost, 4)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono font-medium ${
                        m.margin < 0 ? "text-error" : "text-text-primary"
                      }`}
                    >
                      {fmtUsd(m.margin, 4)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {m.marginPct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          m.status === "negative"
                            ? "bg-error-subtle text-error"
                            : m.status === "thin"
                              ? "bg-warning-subtle text-warning"
                              : "bg-success-subtle text-success"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted">No usage yet.</p>
        )}
      </section>

      {/* ── Section: Operations ── */}
      <section className="rounded-xl border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Operations
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-secondary">
              Request volume (7d)
            </h3>
            {ops.volume7d.length > 0 ? (
              <div className="space-y-1">
                {ops.volume7d.map((v) => (
                  <div
                    key={v.date}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text-muted">{v.date}</span>
                    <span className="font-mono text-text-secondary">
                      {v.count} reqs · {fmtUsd(v.cost, 4)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No requests yet.</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-secondary">
              Top API keys by spend
            </h3>
            {ops.topKeys.length > 0 ? (
              <div className="space-y-1">
                {ops.topKeys.map((k, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-mono text-xs text-text-muted">
                      {k.keyId?.slice(0, 8) ?? "deleted"}…
                    </span>
                    <span className="font-mono text-text-secondary">
                      {k.requests} reqs · {fmtUsd(k.spend, 4)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No keys with usage.</p>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center text-xs text-text-muted">
        Internal · noindex · ADR-024
      </footer>
    </div>
  );
}
