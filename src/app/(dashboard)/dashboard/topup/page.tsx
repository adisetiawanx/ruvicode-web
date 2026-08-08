import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { TopUpPaddle } from "@/components/dashboard/topup-paddle";
import { TopUpUSDC } from "@/components/dashboard/topup-usdc";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top Up",
  robots: { index: false, follow: false },
};

// Placeholder deposit address — in production, generated per-user via HD wallet
const MOCK_DEPOSIT_ADDRESS = "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12";

export default async function TopUpPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Top Up Wallet
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopUpPaddle userId={session.user.id} />
        <TopUpUSDC address={MOCK_DEPOSIT_ADDRESS} />
      </div>
    </div>
  );
}
