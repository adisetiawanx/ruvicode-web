"use client";

import { useState, useTransition } from "react";
import { Plus, Check, Minus } from "lucide-react";
import { addManualTopupAction } from "@/app/(admin)/super/users/[userId]/actions";

const METHODS = [
  { value: "", label: "Select method…" },
  { value: "idr", label: "IDR (bank transfer / QRIS)" },
  { value: "manual", label: "Manual adjustment" },
  { value: "usdc", label: "USDC (on-chain fix)" },
  { value: "paddle", label: "Card (processor fix)" },
  { value: "adjust-debit", label: "Debit balance (reduce)" },
];

/**
 * Admin form: adjust a user's wallet manually. The method is chosen first;
 * the amount and note fields unlock only after a method is selected.
 *
 * "Debit balance" subtracts from the wallet (clamped at zero, never
 * negative) for corrections like chargebacks or mistaken credits. Every
 * other method credits. The amount is always USD.
 */
export function AddTopupForm({ userId, balance }: { userId: string; balance: number }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const isDebit = method === "adjust-debit";
  const methodChosen = method !== "";
  const maxDebit = Math.max(0, balance);

  function setMax() {
    setAmount(maxDebit.toFixed(2));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg({ ok: false, text: "Enter a valid USD amount" });
      return;
    }
    if (isDebit && value > maxDebit) {
      setMsg({ ok: false, text: `Debit cannot exceed the balance ($${maxDebit.toFixed(2)})` });
      return;
    }
    startTransition(async () => {
      const res = await addManualTopupAction(
        userId,
        isDebit ? -value : value,
        isDebit ? "manual" : method,
        note,
      );
      if (res.ok) {
        setMsg({
          ok: true,
          text: isDebit ? `Debited $${value.toFixed(2)}` : `Credited $${value.toFixed(2)}`,
        });
        setAmount("");
        setNote("");
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Step 1: method unlocks everything else */}
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
          Method
        </label>
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setMsg(null);
          }}
          className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent sm:max-w-xs"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {methodChosen && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
                {isDebit ? "Debit amount (USD)" : "Amount (USD)"}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={isDebit ? maxDebit.toFixed(2) : undefined}
                  placeholder={isDebit ? maxDebit.toFixed(2) : "10.00"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-md border border-border-default bg-surface px-3 py-2 font-mono text-sm tabular text-text-primary outline-none focus:border-accent"
                />
                {isDebit && (
                  <button
                    type="button"
                    onClick={setMax}
                    className="h-9 shrink-0 rounded-md border border-border-default bg-surface-2 px-3 text-xs font-medium text-text-secondary transition-colors hover:border-accent/50 hover:text-accent-text"
                    title={`Set to full balance ($${maxDebit.toFixed(2)})`}
                  >
                    Max
                  </button>
                )}
              </div>
              {isDebit && (
                <p className="mt-1 text-xs text-text-muted">
                  Current balance ${balance.toFixed(2)}. Debit never goes below $0.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Note (optional)
              </label>
              <input
                type="text"
                placeholder={isDebit ? "e.g. chargeback correction" : "e.g. QRIS transfer 160k, rate 16,000"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className={
                isDebit
                  ? "inline-flex h-8 items-center gap-1.5 rounded-lg border border-error/40 bg-error/10 px-3 text-sm font-medium text-error transition-colors hover:bg-error/20 disabled:opacity-50"
                  : "inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover active:bg-accent-pressed disabled:opacity-50"
              }
            >
              {isDebit ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {pending ? "Working..." : isDebit ? "Debit balance" : "Add credit"}
            </button>
            {msg && (
              <span
                className={`flex items-center gap-1 text-xs ${
                  msg.ok ? "text-success" : "text-error"
                }`}
              >
                {msg.ok && <Check className="h-3.5 w-3.5" />}
                {msg.text}
              </span>
            )}
          </div>
        </>
      )}
    </form>
  );
}
