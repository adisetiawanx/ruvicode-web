"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Paddle.js overlay checkout component.
 *
 * When the URL contains ?_ptxn=txn_xxx (set by the server action
 * createPaddleTransaction), this component initializes Paddle.js
 * and opens the checkout overlay automatically.
 *
 * Lifecycle (via the eventCallback passed to initializePaddle):
 * - checkout.completed -> redirect to billing so the URL param is
 *   cleaned up and the user sees the credited top-up.
 * - checkout.closed    -> strip the ?_ptxn param so the page returns
 *   to normal (the frame target is unmounted, clicks work again).
 *
 * The token is a client-side token from the Paddle dashboard
 * (Developer Tools > Authentication). It is safe to expose in
 * client-side code, unlike the API key.
 */

const PADDLE_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
const PADDLE_ENV = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

export function PaddleCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const txnId = searchParams.get("_ptxn");
  const [status, setStatus] = useState<"loading" | "open" | "error">("loading");
  const [showFrame, setShowFrame] = useState(true);

  useEffect(() => {
    if (!txnId) return;

    let cancelled = false;

    async function init() {
      try {
        const paddle: Paddle | undefined = await initializePaddle({
          environment: PADDLE_ENV as "sandbox" | "production",
          token: PADDLE_TOKEN,
          eventCallback: (event) => {
            if (event.name === "checkout.completed") {
              // Payment done. The webhook credits the wallet; take the
              // user to billing and drop the ?_ptxn param entirely.
              router.replace("/dashboard/billing");
            } else if (event.name === "checkout.closed") {
              // User dismissed the overlay. Remove the param so this
              // component unmounts the frame target and the page is
              // clickable again.
              setShowFrame(false);
              router.replace("/dashboard/topup");
            }
          },
        });

        if (cancelled || !paddle) {
          if (!paddle) setStatus("error");
          return;
        }

        paddle.Checkout.open({
          transactionId: txnId as string,
          settings: {
            displayMode: "overlay",
            theme: "dark",
            frameTarget: "paddle-checkout-frame",
          },
        });

        if (!cancelled) setStatus("open");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [txnId, router]);

  if (!txnId || !showFrame) return null;

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
              onClick={() => router.replace("/dashboard/topup")}
              className="mt-4 rounded-md bg-accent px-4 py-2 text-sm text-text-inverse"
            >
              Back to top-up
            </button>
          </div>
        </div>
      )}
      {/* Paddle.js mounts the overlay into this frame target. Unmounted
          once the checkout closes or completes so it never blocks the UI. */}
      <div id="paddle-checkout-frame" className="fixed inset-0 z-[200]" />
    </>
  );
}
