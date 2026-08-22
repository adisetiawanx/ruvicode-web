import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getTotalTokensServed } from "@/lib/db/queries/platform-stats";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check — redirect to /login if not authenticated.
  // proxy.ts handles this too (cookie check), but getSession is the
  // authoritative server-side validation.
  const session = await getSession();
  if (!session) redirect("/login");

  // Platform-wide token counter (cached 5 min server-side, effectively free).
  const totalTokensServed = await getTotalTokensServed();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader totalTokensServed={totalTokensServed} />
        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
