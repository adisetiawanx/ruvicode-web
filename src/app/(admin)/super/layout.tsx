import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";

// Server-only auth check. Rendered as a plain 404 for anyone not on the
// allowlist — the page must not leak that it exists.

export const dynamic = "force-dynamic";

// No metadata export: Next streams the head before the async session
// check finishes, which would leak an "Admin" title to anonymous
// visitors even though the body renders as 404. The root layout title
// applies instead, and the middleware sets X-Robots-Tag: noindex.

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
