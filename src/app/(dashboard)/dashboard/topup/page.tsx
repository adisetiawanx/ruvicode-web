import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { TopUpUSDC } from "@/components/dashboard/topup-usdc";
import { TopUpIDR } from "@/components/dashboard/topup-idr";
import { getUsdIdrRate } from "@/lib/exchange-rate";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top Up",
  robots: { index: false, follow: false },
};

export default async function TopUpPage() {
  const session = await getSession();
  if (!session) return null;

  // Fetch the user's deposit address from the gateway (ADR-027). The
  // gateway derives it from the HD wallet and stores it in Postgres on
  // first use. Falls back to a placeholder when the monitor is not
  // configured (local dev without a mnemonic).
  let depositAddress = "USDC deposits coming soon";

  const gatewayUrl = env.GATEWAY_INTERNAL_URL ?? env.NEXT_PUBLIC_API_URL;
  const token = env.INTERNAL_API_TOKEN;
  if (gatewayUrl && token) {
    try {
      const res = await fetch(
        `${gatewayUrl}/internal/deposit-address?user_id=${session.user.id}`,
        { headers: { "X-Internal-Token": token } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.address) depositAddress = data.address as string;
      }
    } catch {
      // Gateway not reachable or monitor not configured — keep placeholder.
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Top Up Wallet
      </h1>

      {/* USDC fills the left column; IDR stacks on the right */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <TopUpUSDC address={depositAddress} />
        <div className="space-y-6">
          <TopUpIDR rate={await getUsdIdrRate()} email={session.user.email} />
        </div>
      </div>
    </div>
  );
}
