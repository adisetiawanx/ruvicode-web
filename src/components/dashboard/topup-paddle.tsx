"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESET_AMOUNTS = [5, 10, 25, 50, 100, 250];

export function TopUpPaddle({ userId }: { userId: string }) {
  const [amount, setAmount] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleCheckout = async () => {
    if (!finalAmount || finalAmount < 5) {
      toast.error("Minimum top-up is $5.00");
      return;
    }
    if (finalAmount > 10000) {
      toast.error("Maximum top-up is $10,000");
      return;
    }

    setLoading(true);

    try {
      // In production: create Paddle transaction via Server Action,
      // then open Paddle checkout overlay.
      // For now: show a placeholder message (Paddle SDK integration
      // happens when PADDLE_API_KEY is configured).
      toast.info(
        "Card top-up is coming soon.",
      );
    } catch {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Suppress unused warning — userId passed to Server Action in production
  void userId;

  const fee = finalAmount ? finalAmount * 0.05 + 0.5 : 0;
  const received = finalAmount ? finalAmount - fee : 0;

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

      {/* Fee transparency */}
      <div className="mb-4 space-y-1 font-mono text-xs tabular text-text-muted">
        <div className="flex justify-between">
          <span>Amount:</span>
          <span>${finalAmount?.toFixed(2) ?? "0.00"}</span>
        </div>
        <div className="flex justify-between">
          <span>Paddle fee (5% + $0.50):</span>
          <span>−${fee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-text-secondary">
          <span>You receive:</span>
          <span>${received.toFixed(2)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={handleCheckout}
        disabled={loading || !finalAmount}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Continue to Checkout
      </Button>
    </div>
  );
}
