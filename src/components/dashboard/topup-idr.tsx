"use client";

import { useMemo, useState } from "react";
import { Send, MessageCircle } from "lucide-react";

const TELEGRAM_URL = "https://t.me/asvmv";

// Amount choices shown from both perspectives: the USD grid and the IDR
// grid carry the same credit values, so switching tabs never loses the
// selection. Rupiah picks are round local numbers.
const TOPUP_CHOICES_USD = [1, 5, 10, 25, 50, 100];
const TOPUP_CHOICES_IDR = [10000, 50000, 100000, 250000, 500000, 1000000];

type Perspective = "usd" | "idr";

function fmtUsd(n: number) {
  return `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}
function fmtIdr(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

/**
 * IDR top-up section. Manual channel for Indonesian users: pick an amount
 * from either perspective (how much credit in USD, or how much Rupiah to
 * pay), or type a custom one, then continue on Telegram where the choice,
 * the live rate, and the account email are pre-filled in the message.
 *
 * Client component: the picker needs interactivity; the exchange rate is
 * still fetched server-side by the parent page and passed in.
 */
export function TopUpIDR({ rate, email }: { rate: number | null; email: string }) {
  const [perspective, setPerspective] = useState<Perspective>("idr");
  // The selected amount is always stored in USD (the wallet currency),
  // rounded to cents; IDR picks are converted through the live rate.
  const [amountUsd, setAmountUsd] = useState<number>(5);
  const [customValue, setCustomValue] = useState("");

  const idrEquivalent = useMemo(
    () => (rate ? Math.round(amountUsd * rate) : null),
    [rate, amountUsd],
  );

  const rateDisplay = rate
    ? `1 USD = Rp${rate.toLocaleString("id-ID")}`
    : "Contact for current rate";

  // Selecting a preset from either grid.
  const selectUsd = (usd: number) => {
    setAmountUsd(usd);
    setCustomValue("");
  };
  const selectIdr = (idr: number) => {
    if (rate) {
      setAmountUsd(Math.round((idr / rate) * 100) / 100);
      setCustomValue("");
    }
  };

  // Custom amount: parsed per the active perspective.
  const applyCustom = (raw: string) => {
    setCustomValue(raw);
    const n = Number(raw.replace(/[^\d.]/g, ""));
    if (!n || n <= 0 || !rate) return;
    if (perspective === "usd") {
      setAmountUsd(Math.round(n * 100) / 100);
    } else {
      setAmountUsd(Math.round((n / rate) * 100) / 100);
    }
  };

  const telegramHref = useMemo(() => {
    const idrPart = idrEquivalent ? ` (sekitar Rp${idrEquivalent.toLocaleString("id-ID")})` : "";
    const ratePart = rate ? ` Kurs saat ini: 1 USD = Rp${rate.toLocaleString("id-ID")}.` : "";
    const text =
      `Halo, saya mau top up wallet Ruvicode sebesar $${amountUsd % 1 === 0 ? amountUsd : amountUsd.toFixed(2)}${idrPart} ` +
      `pakai transfer bank/QRIS.${ratePart} Email akun saya: ${email}`;
    return `${TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
  }, [amountUsd, idrEquivalent, rate, email]);

  const isCustomMatch = (usd: number) => {
    if (!customValue) return false;
    return Math.abs(usd - amountUsd) < 0.005;
  };

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

      {/* Perspective tabs: pick by USD credit or by Rupiah to pay. */}
      <fieldset className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <legend className="text-sm font-medium text-text-primary">
            Choose amount
          </legend>
          <div className="inline-flex rounded-lg border border-border-default bg-surface-2 p-0.5" role="tablist" aria-label="Amount perspective">
            <button
              type="button"
              role="tab"
              aria-selected={perspective === "usd"}
              onClick={() => setPerspective("usd")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                perspective === "usd"
                  ? "bg-accent text-text-inverse"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              USD
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={perspective === "idr"}
              onClick={() => setPerspective("idr")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                perspective === "idr"
                  ? "bg-accent text-text-inverse"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              IDR
            </button>
          </div>
        </div>

        {perspective === "usd" ? (
          <div className="grid grid-cols-3 gap-2">
            {TOPUP_CHOICES_USD.map((usd) => {
              const idr = rate ? Math.round(usd * rate) : null;
              const selected = !customValue && amountUsd === usd;
              return (
                <button
                  key={usd}
                  type="button"
                  onClick={() => selectUsd(usd)}
                  aria-pressed={selected}
                  className={`rounded-lg border px-2 py-2.5 text-center transition-all hover:-translate-y-px hover:border-accent/60 hover:bg-accent/5 ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border-default bg-surface-2"
                  }`}
                >
                  <span className="block font-mono text-sm font-semibold text-text-primary">
                    {fmtUsd(usd)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] tabular text-text-muted">
                    {idr ? fmtIdr(idr) : "-"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {TOPUP_CHOICES_IDR.map((idr) => {
              const usd = rate ? Math.round((idr / rate) * 100) / 100 : null;
              const selected =
                !customValue && usd !== null && Math.abs(usd - amountUsd) < 0.005;
              return (
                <button
                  key={idr}
                  type="button"
                  onClick={() => selectIdr(idr)}
                  disabled={!rate}
                  aria-pressed={selected}
                  className={`rounded-lg border px-2 py-2.5 text-center transition-all hover:-translate-y-px hover:border-accent/60 hover:bg-accent/5 ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border-default bg-surface-2"
                  } ${!rate ? "opacity-50" : ""}`}
                >
                  <span className="block font-mono text-sm font-semibold text-text-primary">
                    {fmtIdr(idr)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] tabular text-text-muted">
                    {usd !== null ? fmtUsd(usd) : "-"}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Custom amount input, follows the active perspective. */}
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-muted">
              {perspective === "usd" ? "$" : "Rp"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customValue}
              onChange={(e) => applyCustom(e.target.value)}
              placeholder={
                perspective === "usd" ? "Custom amount" : "Jumlah custom"
              }
              aria-label="Custom amount"
              className="h-9 w-full rounded-lg border border-border-default bg-surface-2 pl-8 pr-3 font-mono text-sm tabular text-text-primary outline-none transition-colors placeholder:font-sans placeholder:text-text-muted focus:border-accent hover:border-border-strong"
            />
          </div>
        </div>

        {idrEquivalent && (
          <p className="mt-2 text-xs text-text-muted">
            You get <span className="font-medium text-text-secondary">{fmtUsd(amountUsd)}</span>{" "}
            wallet credit for about{" "}
            <span className="font-medium text-text-secondary">
              {fmtIdr(idrEquivalent)}
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
