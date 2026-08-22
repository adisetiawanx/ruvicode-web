"use client";

import { useState } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100, 250];

export function TopUpPaddle() {
  const [amount, setAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");

  const finalAmount = customAmount ? Number(customAmount) : amount;

  return (
    <div className="rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-accent" />
        <h3 className="font-semibold text-text-primary">Pay by Card</h3>
      </div>

      {/* Preset amounts */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PRESET_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => {
              setAmount(amt);
              setCustomAmount("");
            }}
            className={`rounded-md border py-2 text-sm font-mono tabular transition-colors ${
              amount === amt && !customAmount
                ? "border-accent bg-accent-subtle text-accent-text"
                : "border-border-default text-text-secondary hover:border-border-strong"
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mb-4 space-y-1.5">
        <Label htmlFor="custom-amount">Custom Amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            $
          </span>
          <Input
            id="custom-amount"
            type="number"
            min="5"
            max="10000"
            placeholder="Enter amount (min $5)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="pl-7 font-mono tabular"
          />
        </div>
      </div>

      {/* Credits summary */}
      <div className="mb-4 space-y-1 font-mono text-xs tabular text-text-muted">
        <div className="flex justify-between font-semibold text-text-secondary">
          <span>Credits you receive:</span>
          <span>${finalAmount?.toFixed(2) ?? "0.00"}</span>
        </div>
        <p className="pt-1 leading-relaxed">
          Full amount is credited to your wallet. Sales tax, if applicable
          for your country, is calculated at checkout.
        </p>
      </div>

      <Button
        variant="primary"
        className="w-full"
        disabled
        title="Card payments are coming soon. Top up with USDC in the meantime."
      >
        <CreditCard className="h-4 w-4" />
        Coming Soon
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-text-muted">
        Secure checkout opens in a new step at Paddle
        <ExternalLink className="h-3 w-3" />
      </p>
    </div>
  );
}
