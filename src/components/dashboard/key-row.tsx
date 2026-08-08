"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { revokeKeyAction } from "@/app/(dashboard)/dashboard/keys/actions";
import type { ApiKeyData } from "@/lib/db/queries/management";

interface KeyRowProps {
  keyData: ApiKeyData;
}

function formatSpendLimit(daily: string | null, monthly: string | null): string {
  if (!daily && !monthly) return "No limit";
  const parts: string[] = [];
  if (daily) parts.push(`$${Number(daily).toFixed(2)}/day`);
  if (monthly) parts.push(`$${Number(monthly).toFixed(2)}/mo`);
  return parts.join(" · ") || "No limit";
}

function formatLastUsed(date: Date | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function KeyRow({ keyData }: KeyRowProps) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    const result = await revokeKeyAction(keyData.id);
    setRevoking(false);

    if (!result.ok) {
      toast.error(result.message ?? "Failed to revoke key");
      return;
    }

    toast.success(`Key "${keyData.label}" revoked`);
    setRevokeOpen(false);
  };

  return (
    <tr className="border-b border-border-subtle last:border-0">
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-text-primary">
          {keyData.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <code className="font-mono text-sm text-text-secondary">
          rvcd_{keyData.keyPrefix}
          <span className="text-text-muted">····</span>
        </code>
      </td>
      <td className="px-4 py-3 font-mono text-sm tabular text-text-secondary">
        {keyData.rateLimitRpm} RPM
      </td>
      <td className="px-4 py-3 font-mono text-xs tabular text-text-secondary">
        {formatSpendLimit(keyData.spendLimitDaily, keyData.spendLimitMonthly)}
      </td>
      <td className="px-4 py-3 text-sm text-text-muted">
        {formatLastUsed(keyData.lastUsed)}
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Key actions" />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setRevokeOpen(true)}
              className="text-error"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Revoke confirmation */}
        <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Revoke API Key?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-secondary">
              This will permanently revoke the key{" "}
              <Badge variant="outline" className="font-mono">
                {keyData.label}
              </Badge>
              . Any applications using this key will immediately lose API
              access. This action cannot be undone.
            </p>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                variant="danger"
                onClick={handleRevoke}
                disabled={revoking}
              >
                {revoking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Revoke
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
