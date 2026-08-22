"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyUsage } from "@/lib/db/queries/dashboard";

interface UsageChartProps {
  data: DailyUsage[];
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: "14px",
  color: "var(--text-primary)",
};

/**
 * Dashboard weekly usage area chart.
 *
 * Per PAGES.md §5.3, the ONLY permitted gradient is chart area-fill
 * (Clay → transparent). This is functional depth, not decoration.
 * Per PAGES.md §5.4, chart draw-in animation is allowed (Recharts native).
 */
export function UsageChart({ data }: UsageChartProps) {
  const allZero = data.every((d) => d.cost === 0);

  // Relabel each day bucket in the viewer's timezone. The DB buckets by UTC
  // day; the same bucket can be a different weekday for the user, so the
  // label derives from isoDate in the browser and falls back to the server
  // label when isoDate is absent (mock path).
  const chartData = data.map((d) => ({
    ...d,
    date: d.isoDate
      ? new Date(`${d.isoDate}T12:00:00Z`).toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: undefined,
        })
      : d.date,
  }));

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <h3 className="mb-4 font-semibold text-text-primary">Usage This Week</h3>
      {allZero ? (
        <div className="flex h-[300px] items-center justify-center text-center">
          <div>
            <p className="text-sm text-text-muted">No usage data yet.</p>
            <p className="mt-1 text-xs text-text-muted">
              Make your first API request to see charts here.
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="var(--chart-axis)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--chart-axis)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
              width={50}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--text-secondary)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0]?.payload as
                  | { cost: number; tokens?: number; requests?: number }
                  | undefined;
                return (
                  <div className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm shadow-sm">
                    <p className="mb-1 font-medium text-text-primary">{label}</p>
                    <p className="font-mono tabular text-text-secondary">
                      Cost ${Number(point?.cost ?? 0).toFixed(6)}
                    </p>
                    <p className="font-mono tabular text-text-secondary">
                      Tokens {(point?.tokens ?? 0).toLocaleString()}
                    </p>
                  </div>
                );
              }}
              cursor={{
                stroke: "var(--chart-1)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#costGradient)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
