"use client";

import { useState } from "react";
import { Loader2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SweepResult {
  address: string;
  swept_usdc?: number;
  tx_hash?: string;
  status: string;
  skip_reason?: string;
}

export function SweepPanel() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SweepResult[] | null>(null);
  const [total, setTotal] = useState(0);
  const [confirmText, setConfirmText] = useState("");
  const [mode, setMode] = useState<"idle" | "preview" | "execute">("idle");

  // Calls our own /api/admin/sweep route, which holds the internal
  // token server-side. The browser never sees it and never talks to
  // the gateway directly.
  async function doSweep(execute: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sweep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? "Sweep failed");
        return;
      }
      if (execute) {
        setResults(data.results ?? []);
        setTotal(data.total_swept ?? 0);
        setMode("execute");
        toast.success(`Swept $${(data.total_swept ?? 0).toFixed(2)}`);
      } else {
        setResults(data.addresses ?? []);
        setTotal(data.total_usdc ?? 0);
        setMode("preview");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 rounded-xl border border-border-default bg-surface p-6">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-text-primary">
          USDC Sweep
        </h2>
      </div>

      {mode === "idle" && (
        <div>
          <p className="mb-4 text-sm text-text-secondary">
            Consolidate USDC from all deposit addresses into the treasury.
            Click preview first to see what would be swept.
          </p>
          <Button
            onClick={() => doSweep(false)}
            disabled={loading}
            variant="outline"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Preview Sweep
          </Button>
        </div>
      )}

      {mode === "preview" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-right">USDC</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {results?.map((r, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-3 py-2 font-mono text-xs text-text-muted">
                      {r.address?.slice(0, 12)}…
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      ${(r.swept_usdc ?? 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.skip_reason ?? "ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-text-secondary">
            Total: <span className="font-mono font-medium">${total.toFixed(2)}</span> USDC
          </p>
          <div className="space-y-2">
            <Label htmlFor="sweep-confirm">
              Type <code className="font-mono font-semibold text-accent-text">SWEEP</code> to execute
            </Label>
            <div className="flex gap-2">
              <Input
                id="sweep-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="SWEEP"
                className="max-w-[200px]"
              />
              <Button
                onClick={() => doSweep(true)}
                disabled={loading || confirmText !== "SWEEP"}
                variant="default"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Execute Sweep
              </Button>
              <Button
                onClick={() => {
                  setMode("idle");
                  setResults(null);
                  setConfirmText("");
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode === "execute" && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-success">
            Sweep complete. Total: ${total.toFixed(2)} USDC
          </p>
          <div className="overflow-hidden rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <tbody>
                {results?.map((r, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-3 py-2 font-mono text-xs text-text-muted">
                      {r.address?.slice(0, 12)}…
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      ${(r.swept_usdc ?? 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {r.tx_hash ? (
                        <span className="text-success">
                          tx: {r.tx_hash.slice(0, 18)}…
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          {r.skip_reason ?? "skipped"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            onClick={() => {
              setMode("idle");
              setResults(null);
              setConfirmText("");
            }}
            variant="ghost"
          >
            Done
          </Button>
        </div>
      )}
    </section>
  );
}
