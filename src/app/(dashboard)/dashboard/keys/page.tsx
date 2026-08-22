import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { getApiKeys } from "@/lib/db/queries/management";
import { CreateKeyButton } from "@/components/dashboard/create-key-button";
import { KeyRow } from "@/components/dashboard/key-row";
import { EmptyState } from "@/components/shared/empty-state";
import { LinkButton } from "@/components/shared/link-button";
import { BookOpen, KeyRound, Plug } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Keys",
  robots: { index: false, follow: false },
};

export default async function KeysPage() {
  const session = await getSession();
  if (!session) return null;

  const keys = await getApiKeys(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">API Keys</h1>
        <div className="flex items-center gap-2">
          <LinkButton href="/docs" variant="outline" size="sm">
            <BookOpen />
            Docs
          </LinkButton>
          <LinkButton href="/integrations" variant="outline" size="sm">
            <Plug />
            Integrations
          </LinkButton>
          <CreateKeyButton />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
        {keys.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create one to start making requests."
            action={<CreateKeyButton />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border-subtle bg-surface-2/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Rate Limit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Spend Limit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Last Used
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <KeyRow key={key.id} keyData={key} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
