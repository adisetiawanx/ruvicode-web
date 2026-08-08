import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SecuritySection } from "@/components/dashboard/security-section";
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const user = session.user;

  // Fetch linked accounts to show which providers are connected
  let linkedProviders: string[] = [];
  let hasPassword = false;
  try {
    const h = await headers();
    const accounts = await auth.api.listUserAccounts({ headers: h });
    linkedProviders = accounts.map((a: { providerId: string }) => a.providerId);
    hasPassword = accounts.some(
      (a: { providerId: string }) => a.providerId === "credential",
    );
  } catch {
    // Non-critical — just don't show provider list
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>

      {/* Account */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Account
        </h2>
        <ProfileForm
          initialName={user.name ?? ""}
          initialEmail={user.email}
          emailVerified={user.emailVerified ?? false}
        />
      </section>

      {/* Security */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Security
        </h2>
        <SecuritySection
          hasPassword={hasPassword}
          linkedProviders={linkedProviders}
        />
      </section>

      {/* Preferences */}
      <section className="rounded-lg border border-border-default bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Preferences
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Theme</p>
            <p className="text-xs text-text-muted">
              Toggle between dark and light mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-error/30 bg-error-subtle p-6">
        <h2 className="mb-2 text-lg font-semibold text-error">
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Permanently delete your account and all associated data.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
