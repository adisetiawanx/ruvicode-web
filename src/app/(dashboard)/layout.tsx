import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWallet } from "@/lib/db/queries/dashboard";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

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

  // Fetch wallet balance server-side — pass to sidebar + header
  const wallet = await getWallet(session.user.id);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar balance={wallet.balance} userId={session.user.id} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader balance={wallet.balance} userId={session.user.id} />
        <main id="main-content" className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
