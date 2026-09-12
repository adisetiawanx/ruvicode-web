"use client";

import { useMemo, useState } from "react";
import { Send, Wallet, Clock } from "lucide-react";

const TELEGRAM_URL = "https://t.me/asvmv";

// Presets from both perspectives. IDR picks are round local numbers; the
// USD grid carries the values people usually top up. Rp10k (~$0.64) is the
// friendly starter, Rp2.5M (~$160) covers heavy agent users.
const TOPUP_CHOICES_USD = [1, 3, 5, 10, 25, 50, 100, 250];
const TOPUP_CHOICES_IDR = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000];

type Perspective = "usd" | "idr";

function fmtUsd(n: number) {
  return `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}
function fmtIdr(n: number) {
  return `Rp${n.toLocaleString("id-ID")}`;
}

/**
 * IDR top-up section. Manual channel for Indonesian users: pick an amount
 * from either perspective (wallet credit in USD, or Rupiah to pay), or
 * type a custom one, then continue on Telegram where the choice, the live
 * rate, and the account email are pre-filled in the message.
 *
 * Client component: the picker needs interactivity; the exchange rate is
 * still fetched server-side by the parent page and passed in.
 */
export function TopUpIDR({ rate, email }: { rate: number | null; email: string }) {
  const [perspective, setPerspective] = useState<Perspective>("idr");
  // Selection is stored in USD cents precision (the wallet currency);
  // idrDisplay keeps the Rupiah figure the user actually picked so the
  // summary shows round numbers instead of round-trip artifacts.
  const [amountUsd, setAmountUsd] = useState<number>(5);
  const [idrDisplay, setIdrDisplay] = useState<number | null>(50000);
  const [customValue, setCustomValue] = useState("");

  const rateDisplay = rate
    ? `1 USD = Rp${rate.toLocaleString("id-ID")}`
    : "Contact for current rate";

  const selectUsd = (usd: number) => {
    setAmountUsd(usd);
    setIdrDisplay(rate ? Math.round(usd * rate) : null);
    setCustomValue("");
  };
  const selectIdr = (idr: number) => {
    setIdrDisplay(idr);
    if (rate) {
      setAmountUsd(Math.round((idr / rate) * 100) / 100);
      setCustomValue("");
    }
  };

  // Custom amount: parsed per the active perspective. The displayed IDR
  // figure is the raw input when picking in IDR, or the rounded product
  // when picking in USD, so both directions show clean numbers.
  const applyCustom = (raw: string) => {
    setCustomValue(raw);
    const n = Number(raw.replace(/[^\d.]/g, ""));
    if (!n || n <= 0) return;
    if (perspective === "usd") {
      setAmountUsd(Math.round(n * 100) / 100);
      if (rate) setIdrDisplay(Math.round(n * rate));
    } else {
      if (rate) {
        setAmountUsd(Math.round((n / rate) * 100) / 100);
        setIdrDisplay(Math.round(n));
      }
    }
  };

  const telegramHref = useMemo(() => {
    const idrPart = idrDisplay ? ` (about Rp${idrDisplay.toLocaleString("id-ID")})` : "";
    const ratePart = rate ? ` Rate at time of request: 1 USD = Rp${rate.toLocaleString("id-ID")}.` : "";
    const usdPart = amountUsd % 1 === 0 ? String(amountUsd) : amountUsd.toFixed(2);
    const text =
      `Halo, saya mau top up wallet Ruvicode sebesar $${usdPart}${idrPart} ` +
      `pakai transfer bank/QRIS.${ratePart} Email akun saya: ${email}`;
    return `${TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
  }, [amountUsd, idrDisplay, rate, email]);

  const presetMatches = (usd: number) =>
    !customValue && Math.abs(usd - amountUsd) < 0.005;

  return (
    <div className="flex flex-col rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-2 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-text-primary">Top Up in IDR</h3>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Pay with local bank transfer, QRIS, or e-wallet in Rupiah. Credit lands
        in your wallet at the current exchange rate, no crypto needed.
      </p>

      {/* Amount picker with perspective tabs. */}
      <fieldset className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <legend className="text-sm font-medium text-text-primary">
            Amount
          </legend>
          <div className="inline-flex rounded-lg border border-border-default bg-surface-2 p-0.5" role="tablist" aria-label="Amount perspective">
            <button
              type="button"
              role="tab"
              aria-selected={perspective === "usd"}
              onClick={() => setPerspective("usd")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
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
          <div className="grid grid-cols-4 gap-2">
            {TOPUP_CHOICES_USD.map((usd) => {
              const idr = rate ? Math.round(usd * rate) : null;
              const selected = presetMatches(usd);
              return (
                <button
                  key={usd}
                  type="button"
                  onClick={() => selectUsd(usd)}
                  aria-pressed={selected}
                  className={`rounded-lg border px-1.5 py-2 text-center transition-all hover:-translate-y-px hover:border-accent/60 hover:bg-accent/5 ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border-default bg-surface-2"
                  }`}
                >
                  <span className="block font-mono text-sm font-semibold text-text-primary">
                    {fmtUsd(usd)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] tabular text-text-muted">
                    {idr ? fmtIdr(idr) : "-"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
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
                  className={`rounded-lg border px-1.5 py-2 text-center transition-all hover:-translate-y-px hover:border-accent/60 hover:bg-accent/5 ${
                    selected
                      ? "border-accent bg-accent/10"
                      : "border-border-default bg-surface-2"
                  } ${!rate ? "opacity-50" : ""}`}
                >
                  <span className="block font-mono text-[13px] font-semibold text-text-primary">
                    {fmtIdr(idr)}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] tabular text-text-muted">
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
              placeholder={perspective === "usd" ? "Custom amount" : "Custom amount"}
              aria-label="Custom amount"
              className="h-9 w-full rounded-lg border border-border-default bg-surface-2 pl-8 pr-3 font-mono text-sm tabular text-text-primary outline-none transition-colors placeholder:font-sans placeholder:text-text-muted focus:border-accent hover:border-border-strong"
            />
          </div>
        </div>

        {/* Rate + summary in one compact strip. */}
        <div className="mt-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2">
          {rate ? (
            <>
              <p className="font-mono text-xs tabular text-accent-text">{rateDisplay}</p>
              {idrDisplay && (
                <p className="mt-0.5 text-xs text-text-muted">
                  You get{" "}
                  <span className="font-medium text-text-secondary">{fmtUsd(amountUsd)}</span>{" "}
                  wallet credit for about{" "}
                  <span className="font-medium text-text-secondary">{fmtIdr(idrDisplay)}</span>
                  . Final rate confirmed at payment.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-text-muted">{rateDisplay}</p>
          )}
        </div>
      </fieldset>

      <div className="mt-auto pt-4">
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent bg-accent px-2.5 text-sm font-medium text-text-inverse transition-all hover:bg-accent-hover active:translate-y-px active:bg-accent-pressed"
        >
          <Send className="mr-1.5 h-4 w-4" />
          Continue on Telegram
        </a>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <Clock className="h-3.5 w-3.5" />
          Manual confirmation during business hours
        </p>
      </div>
    </div>
  );
}
