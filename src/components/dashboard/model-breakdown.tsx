"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLOR_ARRAY } from "@/lib/constants";
import { displayModelName } from "@/lib/models/display";
import type { ModelBreakdownEntry } from "@/lib/db/queries/dashboard";

interface ModelBreakdownProps {
  data: ModelBreakdownEntry[];
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: "14px",
  color: "var(--text-primary)",
};

/**
 * Dashboard model breakdown donut chart.
 * Uses the Clay/Sky/Olive/Kraft/Fig palette (PAGES.md §13.1).
 * No purple or blue defaults.
 */
export function ModelBreakdown({ data }: ModelBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border-default bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text-primary">
          Model Breakdown
        </h3>
        <div className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-text-muted">No usage data yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <h3 className="mb-4 font-semibold text-text-primary">
        Model Breakdown
      </h3>
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[200px_1fr]">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="cost"
              nameKey="model"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={data.length > 8 ? 0.5 : 2}
              animationDuration={800}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    CHART_COLOR_ARRAY[i % CHART_COLOR_ARRAY.length]
                  }
                  stroke="var(--bg-surface)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `$${Number(value).toFixed(6)}`,
                "Cost",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend — scrollable so many models never stretch the card */}
        <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
          {data.map((item, i) => (
            <div
              key={item.model}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    background:
                      CHART_COLOR_ARRAY[i % CHART_COLOR_ARRAY.length],
                  }}
                />
                <span className="text-text-secondary">{displayModelName(item.model)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono tabular text-text-muted">
                  {item.pct.toFixed(0)}%
                </span>
                <span className="w-20 text-right font-mono tabular text-text-secondary">
                  ${item.cost.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
