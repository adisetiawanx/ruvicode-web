import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { RecentActivityEntry } from "@/lib/db/queries/dashboard";

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
 * Dashboard recent activity table (last 10 requests).
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-y border-border-subtle bg-surface-2/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                  Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">
                  Model
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
                    {timeAgo(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {row.model}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-secondary">
                    {(
                      Number(row.promptTokens) + Number(row.completionTokens)
                    ).toLocaleString()}
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
