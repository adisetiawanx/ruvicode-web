import Link from "next/link";
import { ModelTag } from "@/components/shared/model-tag";
import type { RecentActivityEntry } from "@/lib/db/queries/dashboard";
import { ClientTime } from "@/components/shared/client-time";

interface RecentActivityProps {
  data: RecentActivityEntry[];
}

/** Format a past date as a relative "time ago" string. */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Dashboard recent activity table (last 30 requests, no pager).
 * The full history lives on /dashboard/usage.
 * Compact read-only table. Per PAGES.md, financial numbers use mono tabular.
 */
export function RecentActivity({ data }: RecentActivityProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="font-semibold text-text-primary">Recent Activity</h3>
        <Link
          href="/dashboard/usage"
          className="text-sm text-accent-text hover:text-accent-hover"
        >
          View All →
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="px-6 pb-12 pt-0 text-center">
          <p className="text-sm text-text-muted">No API requests yet.</p>
          <p className="mt-1 text-xs text-text-muted">
            Make your first request to see activity here.
          </p>
        </div>
      ) : (
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 border-y border-border-subtle bg-surface-2/95 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                  Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                  Model
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                  Key
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">
                  Tokens
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border-subtle last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-sm text-text-secondary">
                    <ClientTime utc={row.createdAt} format="relative" />
                  </td>
                  <td className="px-4 py-3">
                    <ModelTag id={row.model} stacked={false} className="[&>span:first-child]:text-xs" />
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {row.keyLabel ?? <span className="text-text-muted">Deleted key</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-secondary">
                    <span className="whitespace-nowrap">
                      {(
                        Number(row.promptTokens) + Number(row.completionTokens)
                      ).toLocaleString()}
                      <span className="ml-1 font-sans text-xs text-text-muted">
                        ·{" "}
                        {Number(row.cacheReadTokens ?? 0).toLocaleString()} (
                        {Number(row.promptTokens) > 0
                          ? Math.round(
                              (Number(row.cacheReadTokens ?? 0) /
                                Number(row.promptTokens)) *
                                100,
                            )
                          : 0}
                        %) cached
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-primary">
                    ${Number(row.cost).toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
