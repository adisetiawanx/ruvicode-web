"use client";

import { useMemo, useState } from "react";
import { Send, MessageCircle } from "lucide-react";

const TELEGRAM_URL = "https://t.me/asvmv";

// Amount choices in USD; the IDR equivalent is computed live from the
// mid-market rate so Indonesian users can pick by the Rupiah number they
// understand while the credit lands in USD.
const TOPUP_CHOICES_USD = [1, 5, 10, 25, 50, 100];

/**
 * IDR top-up section. Manual channel for Indonesian users: pick an amount
 * (shown in both IDR and USD), then continue on Telegram where the choice
 * and account email are pre-filled in the message.
 *
 * Client component: the amount picker needs interactivity; the exchange
 * rate is still fetched server-side by the parent page and passed in.
 */
export function TopUpIDR({ rate, email }: { rate: number | null; email: string }) {
  const [amountUsd, setAmountUsd] = useState<number>(5);

  const idrEquivalent = useMemo(
    () => (rate ? Math.round(amountUsd * rate) : null),
    [rate, amountUsd],
  );

  const rateDisplay = rate
    ? `1 USD = Rp${rate.toLocaleString("id-ID")}`
    : "Contact for current rate";

  const telegramHref = useMemo(() => {
    const idrPart = idrEquivalent
      ? ` (sekitar Rp${idrEquivalent.toLocaleString("id-ID")})`
      : "";
    const text =
      `Halo, saya mau top up wallet Ruvicode sebesar $${amountUsd}${idrPart} ` +
      `pakai transfer bank/QRIS. Email akun saya: ${email}`;
    return `${TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
  }, [amountUsd, idrEquivalent, email]);

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

      {/* Amount picker: pick by USD, see the IDR price live. */}
      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-text-primary">
          Choose amount
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {TOPUP_CHOICES_USD.map((usd) => {
            const idr = rate ? Math.round(usd * rate) : null;
            const selected = amountUsd === usd;
            return (
              <button
                key={usd}
                type="button"
                onClick={() => setAmountUsd(usd)}
                aria-pressed={selected}
                className={`rounded-lg border px-2 py-2.5 text-center transition-colors ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border-default bg-surface-2 hover:border-border-strong"
                }`}
              >
                <span className="block font-mono text-sm font-semibold text-text-primary">
                  ${usd}
                </span>
                <span className="mt-0.5 block font-mono text-[11px] tabular text-text-muted">
                  {idr ? `Rp${idr.toLocaleString("id-ID")}` : "-"}
                </span>
              </button>
            );
          })}
        </div>
        {idrEquivalent && (
          <p className="mt-2 text-xs text-text-muted">
            You get <span className="font-medium text-text-secondary">${amountUsd}</span>{" "}
            wallet credit for about{" "}
            <span className="font-medium text-text-secondary">
              Rp{idrEquivalent.toLocaleString("id-ID")}
            </span>
            .
          </p>
        )}
      </fieldset>

      <ul className="mt-4 space-y-2 text-sm text-text-secondary">
        <li className="flex items-center gap-2">
          <Send className="h-4 w-4 shrink-0 text-accent" />
          Continue on Telegram to arrange the payment
        </li>
        <li className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-accent" />
          Fast manual confirmation during business hours
        </li>
      </ul>

      <div className="mt-auto pt-5">
        <a
          href={telegramHref}
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
