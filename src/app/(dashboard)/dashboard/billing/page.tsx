import type { Metadata } from "next";
import { floorUsd } from "@/lib/models/display";
import { formatTopupMethod } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { getTopups } from "@/lib/db/queries/management";
import { getWallet } from "@/lib/db/queries/dashboard";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billing History",
  robots: { index: false, follow: false },
};

export default async function BillingPage() {
  const session = await getSession();
  if (!session) return null;

  const [topups, wallet] = await Promise.all([
    getTopups(session.user.id),
    getWallet(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Billing History
      </h1>

      {/* Summary cards — Balance first (same style as overview) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BalanceCard balance={wallet.balance} held={wallet.held} />
        <StatCard
          label="Total Loaded"
          value={`$${floorUsd(wallet.totalLoaded).toFixed(2)}`}
        />
        <StatCard
          label="Total Spent"
          value={`$${floorUsd(wallet.totalSpent).toFixed(2)}`}
        />
      </div>

      {/* Top-ups table */}
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        {topups.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Top up your wallet to get started."
            actionLabel="Top Up →"
            actionHref="/dashboard/topup"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle bg-surface-2/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Method
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {topups.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-text-secondary">
                      {t.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {formatTopupMethod(t.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-primary">
                      ${Number(t.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-muted">
                      ${Number(t.fee).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed"
      ? "default"
      : status === "pending"
        ? "secondary"
        : "destructive";
  const colorClass =
    status === "completed"
      ? "text-success"
      : status === "pending"
        ? "text-warning"
        : "text-error";

  return (
    <Badge variant={variant} className={`capitalize ${colorClass}`}>
      {status}
    </Badge>
  );
}
