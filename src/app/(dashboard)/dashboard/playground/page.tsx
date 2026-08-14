import type { Metadata } from "next";
import { getAllActiveModels } from "@/lib/db/queries/models";
import { PlaygroundChat } from "@/components/marketing/playground-chat";
import { dashboardPlaygroundChat } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  robots: { index: false, follow: false },
};

export default async function DashboardPlaygroundPage() {
  const models = await getAllActiveModels();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Playground</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Try any model without touching your API keys. 50 requests per hour.
        </p>
      </div>

      <PlaygroundChat
        models={models}
        action={dashboardPlaygroundChat}
        showSignupCta={false}
        hint="Try any model without touching your API keys."
        hintSub="Signed in, so you get 50 requests per hour."
        remainingPrefix="requests remaining this hour"
      />
    </div>
  );
}
