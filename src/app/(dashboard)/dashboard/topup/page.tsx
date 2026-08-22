import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { TopUpPaddle } from "@/components/dashboard/topup-paddle";
import { TopUpUSDC } from "@/components/dashboard/topup-usdc";
import { PaddleCheckout } from "@/components/dashboard/paddle-checkout";
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
      {/* Opens the Paddle overlay when URL has ?_ptxn=txn_xxx */}
      <Suspense fallback={null}>
        <PaddleCheckout />
      </Suspense>
      <h1 className="text-2xl font-semibold text-text-primary">
        Top Up Wallet
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopUpPaddle userId={session.user.id} />
        <TopUpUSDC address={depositAddress} />
      </div>
    </div>
  );
}
