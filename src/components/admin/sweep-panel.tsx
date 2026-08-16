"use client";

import { useState } from "react";
import { ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PreviewAddress {
  address: string;
  user_id?: string | null;
  usdc_balance: number;
  eth_balance: number;
  needs_gas: boolean;
  estimated_gas_eth: number;
  action: string;
  status: string;
  reason?: string;
}

interface SweepPreview {
  preview_id: string;
  expires_at: string;
  network: string;
  chain_id: number;
  usdc_contract: string;
  treasury: string;
  treasury_usdc: number;
  treasury_eth: number;
  addresses: PreviewAddress[];
  total_usdc: number;
  total_gas_needed_eth: number;
  treasury_can_fund: boolean;
}

interface SweepResult {
  address: string;
  swept_usdc?: number;
  tx_hash?: string;
  status: string;
  skip_reason?: string;
}

interface SweepResponse {
  operation_id?: string;
  status?: string;
  treasury?: string;
  funding?: { address: string; amount_eth: number; tx_hash?: string; status: string }[];
  results?: SweepResult[];
  total_swept?: number;
  gas_funded_eth?: number;
  audit_id?: string;
}

function usd(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

function short(value: string) {
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

export function SweepPanel() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<SweepPreview | null>(null);
  const [result, setResult] = useState<SweepResponse | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [mode, setMode] = useState<"idle" | "preview" | "confirm" | "result">("idle");

  async function requestSweep(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/sweep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error?.message ?? data?.error ?? "Sweep request failed");
    return data;
  }

  async function previewSweep() {
    setLoading(true);
    try {
      const data = (await requestSweep({ execute: false, preview_id: null })) as SweepPreview;
      setPreview(data);
      setMode("preview");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load sweep preview");
    } finally {
      setLoading(false);
    }
  }

  async function executeSweep() {
    if (!preview || confirmText !== "SWEEP") return;
    setLoading(true);
    try {
      const data = (await requestSweep({
        execute: true,
        preview_id: preview.preview_id,
        confirmation: confirmText,
      })) as SweepResponse;
      setResult(data);
      setMode("result");
      setConfirmText("");
      toast.success(data.status === "completed" ? "Sweep completed" : "Sweep finished with exceptions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sweep failed");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setConfirmText("");
    setMode("idle");
  }

  const explorer = (hash: string) =>
    `https://basescan.org/tx/${hash}`;

  return (
    <section className="rounded-lg border border-border-default bg-surface p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-text-muted">On-chain operations</p>
          <h2 className="mt-1 font-semibold text-text-primary">USDC sweep</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Consolidate deposit balances into the treasury without changing user liability.
          </p>
        </div>
        {mode === "idle" && (
          <Button variant="outline" onClick={previewSweep} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            Preview sweep
          </Button>
        )}
      </div>

      {mode === "idle" && (
        <p className="text-sm text-text-muted">Preview the current on-chain balances before moving funds.</p>
      )}

      {mode === "preview" && preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Sweepable", usd(preview.total_usdc)],
              ["Addresses", String(preview.addresses.length)],
              ["Gas needed", `${preview.total_gas_needed_eth.toFixed(5)} ETH`],
              ["Treasury ETH", `${preview.treasury_eth.toFixed(5)} ETH`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-border-subtle bg-surface-2 p-3">
                <p className="text-xs text-text-muted">{label}</p>
                <p className="mt-1 font-mono text-sm tabular text-text-primary">{value}</p>
              </div>
            ))}
          </div>

          {!preview.treasury_can_fund && (
            <div className="flex gap-2 rounded-md border border-error/30 bg-error-subtle p-3 text-sm text-error">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              Treasury does not have enough ETH to fund this sweep.
            </div>
          )}

          <div className="overflow-x-auto rounded-md border border-border-subtle">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-right">USDC</th>
                  <th className="px-3 py-2 text-right">ETH</th>
                  <th className="px-3 py-2 text-left">Gas</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {preview.addresses.map((address) => (
                  <tr key={address.address} className="border-b border-border-subtle last:border-0">
                    <td className="px-3 py-2 font-mono text-xs text-text-secondary">{short(address.address)}</td>
                    <td className="px-3 py-2 text-right font-mono">{usd(address.usdc_balance)}</td>
                    <td className="px-3 py-2 text-right font-mono">{address.eth_balance.toFixed(5)}</td>
                    <td className="px-3 py-2 text-xs">
                      <span className={address.needs_gas ? "text-warning" : "text-success"}>
                        {address.needs_gas ? "Needs funding" : "Ready"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-text-secondary">{address.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border border-warning/30 bg-warning-subtle p-4">
            <p className="text-sm text-text-primary">
              This will move {usd(preview.total_usdc)} USDC to {short(preview.treasury)}.
            </p>
            <p className="mt-1 text-xs text-text-secondary">Type SWEEP to continue.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="SWEEP" className="sm:max-w-48" />
              <Button variant="danger" onClick={executeSweep} disabled={loading || confirmText !== "SWEEP" || !preview.treasury_can_fund}>
                {loading && <Loader2 className="animate-spin" />}
                Execute sweep
              </Button>
              <Button variant="ghost" onClick={reset} disabled={loading}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {mode === "result" && result && (
        <div className="space-y-4">
          <div className={result.status === "completed" ? "rounded-md border border-success/30 bg-success-subtle p-4" : "rounded-md border border-warning/30 bg-warning-subtle p-4"}>
            <p className="font-medium text-text-primary">Sweep {result.status ?? "finished"}</p>
            <p className="mt-1 font-mono text-sm">{usd(result.total_swept ?? 0)} swept · {(result.gas_funded_eth ?? 0).toFixed(5)} ETH funded</p>
          </div>
          <div className="overflow-x-auto rounded-md border border-border-subtle">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-surface-2 text-xs text-text-muted"><tr><th className="px-3 py-2 text-left">Address</th><th className="px-3 py-2 text-right">USDC</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Transaction</th></tr></thead>
              <tbody>
                {(result.results ?? []).map((item) => (
                  <tr key={`${item.address}-${item.tx_hash ?? item.status}`} className="border-b border-border-subtle last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{short(item.address)}</td>
                    <td className="px-3 py-2 text-right font-mono">{usd(item.swept_usdc ?? 0)}</td>
                    <td className="px-3 py-2 text-xs">{item.status}</td>
                    <td className="px-3 py-2 text-xs">
                      {item.tx_hash ? <a className="inline-flex items-center gap-1 text-accent-text hover:text-accent-hover" href={explorer(item.tx_hash)} target="_blank" rel="noreferrer">{short(item.tx_hash)} <ExternalLink className="h-3 w-3" /></a> : item.skip_reason ?? "No transaction"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="ghost" onClick={reset}>Done</Button>
        </div>
      )}
    </section>
  );
}
