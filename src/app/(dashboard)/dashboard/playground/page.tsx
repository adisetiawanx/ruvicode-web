import type { Metadata } from "next";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { getApiKeys } from "@/lib/db/queries/management";
import { getSession } from "@/lib/session";
import { PlaygroundChat } from "@/components/marketing/playground-chat";
import { EmptyState } from "@/components/shared/empty-state";
import { KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  robots: { index: false, follow: false },
};

export default async function DashboardPlaygroundPage() {
  const session = await getSession();
  if (!session) return null;

  const models = await getAllActiveModels();
  const keys = await getApiKeys(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Playground</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Try any model with your own API key. Requests are billed to your
          wallet, with your key&apos;s rate and spend limits applied.
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface">
          <EmptyState
            icon={KeyRound}
            title="No active API key"
            description="Create an API key first, then use the playground with it."
            actionLabel="Create API Key"
            actionHref="/dashboard/keys"
          />
        </div>
      ) : (
        <PlaygroundChat
          models={models}
          endpoint="/api/dashboard/playground/chat"
          statsPosition="right"
          showSignupCta={false}
          activeKeyLabel={keys[0]?.label}
          hint="Try any model with your own key."
          hintSub="Billed to your wallet at real per-request prices. Chat history is not stored."
        />
      )}
    </div>
  );
}
