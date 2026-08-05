import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check — redirect to /login if not authenticated
  // (Real implementation in auth ADR; placeholder for now)
  // const session = await getSession();
  // if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
