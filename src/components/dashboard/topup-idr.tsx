import { Send, MessageCircle } from "lucide-react";
import { LinkButton } from "@/components/shared/link-button";

const TELEGRAM_URL = "https://t.me/asvmv";

/**
 * IDR top-up section. Manual channel for Indonesian users: contact on
 * Telegram, arrange a local bank transfer / QRIS payment in Rupiah, and the
 * credit is added to the wallet. Keeps the payment rails that already exist
 * (USDC on-chain, card via processor) untouched.
 *
 * Server component: the exchange rate is fetched by the parent page and
 * passed in, so the client never calls the rate API directly.
 */
export function TopUpIDR({ rate }: { rate: number | null }) {
  const rateDisplay = rate
    ? `1 USD = Rp${rate.toLocaleString("id-ID")}`
    : "Contact for current rate";

  return (
    <div className="flex flex-col rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-accent">Rp</span>
        <h3 className="font-semibold text-text-primary">
          Top Up in IDR
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Pay with local bank transfer, QRIS, or e-wallet in Rupiah. Credit is
        added to your wallet at the current exchange rate, no crypto needed.
      </p>

      {rate && (
        <div className="mt-3 rounded-md border border-border-subtle bg-surface-2 px-3 py-2">
          <p className="font-mono text-sm font-medium tabular text-accent-text">
            {rateDisplay}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            Mid-market rate. Final rate confirmed at payment.
          </p>
        </div>
      )}

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
        <a
          href={`${TELEGRAM_URL}?text=${encodeURIComponent(
            "Halo, saya mau top up wallet Ruvicode pakai IDR (transfer bank/QRIS). Email akun saya: ",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent bg-accent px-2.5 text-sm font-medium text-text-inverse transition-all hover:bg-accent-hover active:translate-y-px active:bg-accent-pressed"
        >
          <Send className="mr-1.5 h-4 w-4" />
          Continue on Telegram
        </a>
      </div>
    </div>
  );
}
