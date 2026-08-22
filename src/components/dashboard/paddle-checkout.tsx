"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Paddle.js overlay checkout component.
 *
 * When the URL contains ?_ptxn=txn_xxx (set by the server action
 * createPaddleTransaction), this component initializes Paddle.js
 * and opens the checkout overlay automatically.
 *
 * The token is a client-side token from Paddle dashboard
 * (Developer Tools > Authentication). It is safe to expose in
 * client-side code, unlike the API key.
 */

const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

export function PaddleCheckout() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get("_ptxn");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!txnId) return;

    let cancelled = false;

    async function init() {
      try {
        const paddle: Paddle | undefined = await initializePaddle({
          environment: PADDLE_ENV as "sandbox" | "production",
          token: PADDLE_TOKEN,
        });

        if (cancelled || !paddle) {
          if (!paddle) setStatus("error");
          return;
        }

        // Open the checkout overlay for this transaction
        paddle.Checkout.open({
          transactionId: txnId as string,
          settings: {
            displayMode: "overlay",
            theme: "dark",
            frameTarget: "paddle-checkout-frame",
          },
        });

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [txnId]);

  if (!txnId) return null;

  return (
    <>
      {status === "loading" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      )}
      {status === "error" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-surface p-6 text-center">
            <p className="text-text-primary">
              Checkout failed to load. Please try again.
            </p>
            <button
              onClick={() => window.location.assign("/dashboard/topup")}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm text-text-inverse"
            >
              Back to top-up
            </button>
          </div>
        </div>
      )}
      {/* Paddle.js mounts the overlay into this frame target */}
      <div id="paddle-checkout-frame" className="fixed inset-0 z-[200]" />
    </>
  );
}
