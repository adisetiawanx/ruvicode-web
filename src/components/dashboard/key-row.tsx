"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  revokeKeyAction,
  updateKeyLimitsAction,
} from "@/app/(dashboard)/dashboard/keys/actions";
import type { ApiKeyData } from "@/lib/db/queries/management";

interface KeyRowProps {
  keyData: ApiKeyData;
}

interface EditErrors {
  label?: string[];
  rateLimitRpm?: string[];
  spendLimitDaily?: string[];
  spendLimitMonthly?: string[];
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

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [label, setLabel] = useState(keyData.label);
  const [rateLimitRpm, setRateLimitRpm] = useState(
    String(keyData.rateLimitRpm),
  );
  const [spendLimitDaily, setSpendLimitDaily] = useState(
    keyData.spendLimitDaily ?? "",
  );
  const [spendLimitMonthly, setSpendLimitMonthly] = useState(
    keyData.spendLimitMonthly ?? "",
  );

  const openEdit = () => {
    setLabel(keyData.label);
    setRateLimitRpm(String(keyData.rateLimitRpm));
    setSpendLimitDaily(keyData.spendLimitDaily ?? "");
    setSpendLimitMonthly(keyData.spendLimitMonthly ?? "");
    setEditErrors({});
    setEditOpen(true);
  };

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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditErrors({});

    const result = await updateKeyLimitsAction(keyData.id, {
      label,
      rateLimitRpm: Number(rateLimitRpm),
      spendLimitDaily: spendLimitDaily ? Number(spendLimitDaily) : null,
      spendLimitMonthly: spendLimitMonthly ? Number(spendLimitMonthly) : null,
    });

    setSaving(false);

    if (!result.ok) {
      if (result.errors) setEditErrors(result.errors);
      toast.error(result.message);
      return;
    }

    toast.success("Key updated");
    setEditOpen(false);
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
            <DropdownMenuItem onClick={openEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Limits
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setRevokeOpen(true)}
              className="text-error"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Edit limits dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <form onSubmit={handleEdit}>
              <DialogHeader className="mb-2">
                <DialogTitle>Edit API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-key-label">Label</Label>
                  <Input
                    id="edit-key-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Production"
                    aria-invalid={!!editErrors.label}
                    aria-describedby={
                      editErrors.label ? "edit-key-label-error" : undefined
                    }
                  />
                  {editErrors.label && (
                    <p
                      id="edit-key-label-error"
                      className="text-xs text-error"
                      role="alert"
                    >
                      {editErrors.label[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-key-rpm">
                    Rate Limit (requests/min)
                  </Label>
                  <Input
                    id="edit-key-rpm"
                    type="number"
                    min="1"
                    max="1000000"
                    value={rateLimitRpm}
                    onChange={(e) => setRateLimitRpm(e.target.value)}
                    aria-invalid={!!editErrors.rateLimitRpm}
                    aria-describedby={
                      editErrors.rateLimitRpm ? "edit-key-rpm-error" : undefined
                    }
                    className="font-mono tabular"
                  />
                  {editErrors.rateLimitRpm && (
                    <p
                      id="edit-key-rpm-error"
                      className="text-xs text-error"
                      role="alert"
                    >
                      {editErrors.rateLimitRpm[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-key-daily">Daily Spend Limit ($)</Label>
                    <Input
                      id="edit-key-daily"
                      type="number"
                      min="0"
                      step="0.01"
                      value={spendLimitDaily}
                      onChange={(e) => setSpendLimitDaily(e.target.value)}
                      placeholder="Optional"
                      aria-invalid={!!editErrors.spendLimitDaily}
                      aria-describedby={
                        editErrors.spendLimitDaily
                          ? "edit-key-daily-error"
                          : undefined
                      }
                      className="font-mono tabular"
                    />
                    {editErrors.spendLimitDaily && (
                      <p
                        id="edit-key-daily-error"
                        className="text-xs text-error"
                        role="alert"
                      >
                        {editErrors.spendLimitDaily[0]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-key-monthly">Monthly Limit ($)</Label>
                    <Input
                      id="edit-key-monthly"
                      type="number"
                      min="0"
                      step="0.01"
                      value={spendLimitMonthly}
                      onChange={(e) => setSpendLimitMonthly(e.target.value)}
                      placeholder="Optional"
                      aria-invalid={!!editErrors.spendLimitMonthly}
                      aria-describedby={
                        editErrors.spendLimitMonthly
                          ? "edit-key-monthly-error"
                          : undefined
                      }
                      className="font-mono tabular"
                    />
                    {editErrors.spendLimitMonthly && (
                      <p
                        id="edit-key-monthly-error"
                        className="text-xs text-error"
                        role="alert"
                      >
                        {editErrors.spendLimitMonthly[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Revoke confirmation */}
        <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
          <DialogContent>
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
