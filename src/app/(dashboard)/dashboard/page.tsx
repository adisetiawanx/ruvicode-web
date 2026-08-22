import type { Metadata } from "next";
import { floorUsd } from "@/lib/models/display";
import { getSession } from "@/lib/session";
import {
  getWallet,
  getMonthlySummary,
  getWeeklyUsage,
  getModelBreakdown,
  getRecentActivity,
} from "@/lib/db/queries/dashboard";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { ModelBreakdown } from "@/components/dashboard/model-breakdown";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export const dynamic = "force-dynamic"; // Always fresh — protected dashboard

export const metadata: Metadata = {
  title: "Dashboard Overview",
  robots: { index: false, follow: false }, // Private page
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null; // Middleware (proxy.ts) handles redirect

  const userId = session.user.id;

  // Parallel data fetch — all parameterized, scoped to userId
  const [wallet, monthlySummary, weeklyUsage, modelBreakdown, recentActivity] =
    await Promise.all([
      getWallet(userId),
      getMonthlySummary(userId),
      getWeeklyUsage(userId),
      getModelBreakdown(userId),
      getRecentActivity(userId, 10),
    ]);

  const availableBalance = floorUsd(
    Number(wallet.balance) - Number(wallet.held),
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Overview</h1>

      {/* Top row: 3 stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BalanceCard balance={wallet.balance} held={wallet.held} />
        <StatCard
          label="This Month"
          value={`$${floorUsd(monthlySummary.spent).toFixed(2)}`}
          sublabel={`${monthlySummary.requestCount.toLocaleString()} requests · $${floorUsd(monthlySummary.savings).toFixed(2)} saved`}
        />
        <StatCard
          label="Total Loaded"
          value={`$${floorUsd(wallet.totalLoaded).toFixed(2)}`}
          sublabel={`Total spent: $${floorUsd(wallet.totalSpent).toFixed(2)}`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UsageChart data={weeklyUsage} />
        <ModelBreakdown data={modelBreakdown} />
      </div>

      {/* Recent activity */}
      <RecentActivity data={recentActivity} />

      {/* Hidden available balance for potential client reads */}
      <span className="sr-only" aria-hidden="true">
        Available balance: ${availableBalance}
      </span>
    </div>
  );
}
