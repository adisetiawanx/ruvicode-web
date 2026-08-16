import { AdminDashboardSidebar } from "@/components/layout/sidebar";
import { AdminDashboardHeader } from "@/components/layout/admin-dashboard-header";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function allowed(email: string | null | undefined) { return !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !allowed(session.user.email)) return notFound();
  return <div className="flex min-h-screen"><AdminDashboardSidebar /><div className="flex min-w-0 flex-1 flex-col"><AdminDashboardHeader /><main id="main-content" className="flex-1 p-6 md:p-8">{children}</main></div></div>;
}
