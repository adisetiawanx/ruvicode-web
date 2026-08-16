import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) return notFound();

  const adminEmails = getAdminEmails();
  const userEmail = (session.user.email ?? "").toLowerCase();
  if (!adminEmails.includes(userEmail)) return notFound();

  return <div className="min-h-screen bg-canvas">{children}</div>;
}
