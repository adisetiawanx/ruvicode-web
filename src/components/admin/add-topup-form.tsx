"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { addManualTopupAction } from "@/app/(admin)/super/users/[userId]/actions";

const METHODS = [
  { value: "idr", label: "IDR (bank transfer / QRIS)" },
  { value: "manual", label: "Manual adjustment" },
  { value: "usdc", label: "USDC (on-chain fix)" },
  { value: "paddle", label: "Card (processor fix)" },
];

/**
 * Admin form: credit a user's wallet manually. The amount is always USD;
 * the method records where the money actually came from (IDR transfer,
 * manual correction, failed-deposit fix).
 */
export function AddTopupForm({ userId }: { userId: string }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("idr");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMsg({ ok: false, text: "Enter a valid USD amount" });
      return;
    }
    startTransition(async () => {
      const res = await addManualTopupAction(userId, value, method, note);
      if (res.ok) {
        setMsg({ ok: true, text: `Credited $${value.toFixed(2)}` });
        setAmount("");
        setNote("");
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed" });
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
            Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 font-mono text-sm tabular text-text-primary outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
            Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-text-muted">
          Note (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. QRIS transfer 160k, rate 16,000"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover active:bg-accent-pressed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {pending ? "Adding..." : "Add credit"}
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
    </form>
  );
}
