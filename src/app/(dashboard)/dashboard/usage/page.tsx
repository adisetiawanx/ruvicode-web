import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import {
  getUsageRecords,
  getUsageCount,
  getUsageSummary,
  getUniqueModels,
  getUniqueKeyLabels,
} from "@/lib/db/queries/management";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageFiltersClient } from "@/components/dashboard/usage-filters";
import { UsageExportButton } from "@/components/dashboard/usage-export-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ModelTag } from "@/components/shared/model-tag";
import { ClientTime } from "@/components/shared/client-time";
import { FileSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usage History",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UsagePage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) return null;

  const params = await searchParams;
  const model = typeof params.model === "string" ? params.model : undefined;
  const dateFrom =
    typeof params.dateFrom === "string" ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : undefined;
  const keyLabel =
    typeof params.keyLabel === "string" ? params.keyLabel : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const filterBase = {
    model: model && model !== "all" ? model : undefined,
    dateFrom,
    dateTo,
    keyLabel: keyLabel && keyLabel !== "all" ? keyLabel : undefined,
  };

  const [records, totalCount, summary, models, keyLabels] = await Promise.all([
    getUsageRecords(session.user.id, {
      ...filterBase,
      page,
      pageSize: PAGE_SIZE,
    }),
    getUsageCount(session.user.id, filterBase),
    getUsageSummary(session.user.id, filterBase),
    getUniqueModels(session.user.id),
    getUniqueKeyLabels(session.user.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Usage History
      </h1>

      {/* Filters */}
      <UsageFiltersClient
        models={models}
        keyLabels={keyLabels}
        currentModel={model}
        currentKeyLabel={keyLabel}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Requests"
          value={summary.totalRequests.toLocaleString()}
        />
        <StatCard
          label="Tokens"
          value={summary.totalTokens.toLocaleString()}
        />
        <StatCard
          label="Cost"
          value={`$${summary.totalCost.toFixed(6)}`}
        />
      </div>

      {/* Table + export */}
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <UsageExportButton
            model={model}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          {records.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="No requests found"
              description="Try adjusting your filters or date range."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border-subtle bg-surface-2/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                      Model
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                      Key
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                      Tokens In
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                      Tokens Out
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-text-secondary">
                        <ClientTime utc={row.createdAt} format="datetime" />
                      </td>
                      <td className="px-4 py-3">
                        <ModelTag id={row.model} stacked={false} />
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary">
                        {row.keyLabel ?? <span className="text-text-muted">Deleted key</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-secondary">
                        {row.promptTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm tabular text-text-secondary">
                        {row.completionTokens.toLocaleString()}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Page {page} of {totalPages} · {totalCount} total records
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/dashboard/usage?${buildParams({ model, keyLabel, dateFrom, dateTo, page: page - 1 })}`}
                  className="inline-flex h-8 items-center rounded-md border border-border-default px-3 text-sm text-text-secondary transition-colors hover:bg-surface-2"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="inline-flex h-8 cursor-not-allowed items-center rounded-md border border-border-subtle px-3 text-sm text-text-muted opacity-50">
                  ← Prev
                </span>
              )}
              {page < totalPages ? (
                <Link
                  href={`/dashboard/usage?${buildParams({ model, keyLabel, dateFrom, dateTo, page: page + 1 })}`}
                  className="inline-flex h-8 items-center rounded-md border border-border-default px-3 text-sm text-text-secondary transition-colors hover:bg-surface-2"
                >
                  Next →
                </Link>
              ) : (
                <span className="inline-flex h-8 cursor-not-allowed items-center rounded-md border border-border-subtle px-3 text-sm text-text-muted opacity-50">
                  Next →
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildParams(opts: {
  model?: string;
  keyLabel?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
}): string {
  const params = new URLSearchParams();
  if (opts.model && opts.model !== "all") params.set("model", opts.model);
  if (opts.keyLabel && opts.keyLabel !== "all") params.set("keyLabel", opts.keyLabel);
  if (opts.dateFrom) params.set("dateFrom", opts.dateFrom);
  if (opts.dateTo) params.set("dateTo", opts.dateTo);
  params.set("page", String(opts.page));
  return params.toString();
}
