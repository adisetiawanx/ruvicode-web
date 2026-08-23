"use client";

import { Send, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";

const TELEGRAM_URL = "https://t.me/asvmv";

/**
 * IDR top-up section. Manual channel for Indonesian users: contact on
 * Telegram, arrange a local bank transfer / QRIS payment in Rupiah, and the
 * credit is added to the wallet. Keeps the payment rails that already exist
 * (USDC on-chain, card via processor) untouched.
 */
export function TopUpIDR() {
  return (
    <div className="flex flex-col rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-accent">Rp</span>
        <h3 className="font-semibold text-text-primary">
          Top Up in IDR (Indonesian Rupiah)
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Pay with local bank transfer, QRIS, or e-wallet in Rupiah. Credit is
        added to your wallet at the current exchange rate, no crypto needed.
      </p>

      <ul className="mt-4 space-y-2 text-sm text-text-secondary">
        <li className="flex items-center gap-2">
          <Send className="h-4 w-4 shrink-0 text-accent" />
          Message us on Telegram to arrange the payment
        </li>
        <li className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
          Fast manual confirmation during business hours
        </li>
      </ul>

      <div className="mt-auto pt-5">
        <LinkButton
          href={TELEGRAM_URL}
          variant="outline"
          className="w-full"
        >
          <Send className="mr-1.5 h-4 w-4" />
          Contact @asvmv on Telegram
        </LinkButton>
      </div>
    </div>
  );
}
