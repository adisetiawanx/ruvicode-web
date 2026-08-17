"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ChartDay { date: string; isoDate?: string; count: number; cost: number }

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: "14px",
  color: "var(--text-primary)",
};

function relabel(data: ChartDay[]) {
  return data.map((d) => ({ ...d, date: d.isoDate ? new Date(`${d.isoDate}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short" }) : d.date }));
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-center">
      <div>
        <p className="text-sm text-text-muted">No data to display.</p>
        <p className="mt-1 text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export function AdminRequestsChart({ data }: { data: ChartDay[] }) {
  const chartData = relabel(data);
  const allZero = data.every((d) => d.count === 0);
  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <h3 className="mb-4 font-semibold text-text-primary">Requests, last 7 days</h3>
      {allZero ? <EmptyChart label="API requests will appear here." /> : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adminRequestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text-secondary)" }} formatter={(value) => [Number(value).toLocaleString(), "Requests"]} cursor={{ stroke: "var(--chart-1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} fill="url(#adminRequestsGradient)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function AdminChargesChart({ data }: { data: ChartDay[] }) {
  const chartData = relabel(data);
  const allZero = data.every((d) => d.cost === 0);
  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <h3 className="mb-4 font-semibold text-text-primary">Charges, last 7 days</h3>
      {allZero ? <EmptyChart label="User charges will appear here." /> : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="adminChargesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--chart-axis)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v.toFixed(2)}`} width={50} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--text-secondary)" }} formatter={(value) => [`$${Number(value).toFixed(6)}`, "Charges"]} cursor={{ stroke: "var(--chart-1)", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area type="monotone" dataKey="cost" stroke="var(--chart-1)" strokeWidth={2} fill="url(#adminChargesGradient)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
