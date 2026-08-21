"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { KeyReveal } from "@/components/dashboard/key-reveal";
import { createKeyAction } from "@/app/(dashboard)/dashboard/keys/actions";
import { trackKeyCreated } from "@/lib/analytics";
import type { CreateKeyResult } from "@/app/(dashboard)/dashboard/keys/actions";

interface FormErrors {
  label?: string[];
  rateLimitRpm?: string[];
  spendLimitDaily?: string[];
  spendLimitMonthly?: string[];
}

export function CreateKeyButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form fields
  const [label, setLabel] = useState("");
  const [rateLimitRpm, setRateLimitRpm] = useState("700");
  const [spendLimitDaily, setSpendLimitDaily] = useState("");
  const [spendLimitMonthly, setSpendLimitMonthly] = useState("");

  const resetForm = () => {
    setLabel("");
    setRateLimitRpm("700");
    setSpendLimitDaily("");
    setSpendLimitMonthly("");
    setErrors({});
  };

  const handleClose = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Clear created key after modal closes — it's gone forever
      setTimeout(() => {
        setCreatedKey(null);
        resetForm();
      }, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result: CreateKeyResult = await createKeyAction({
      label,
      rateLimitRpm: Number(rateLimitRpm),
      spendLimitDaily: spendLimitDaily ? Number(spendLimitDaily) : null,
      spendLimitMonthly: spendLimitMonthly ? Number(spendLimitMonthly) : null,
    });

    setLoading(false);

    if (!result.ok) {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast.error(result.message);
      return;
    }

    trackKeyCreated();
    toast.success("API key created");
    setCreatedKey(result.key);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger
        render={
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            Create Key
          </Button>
        }
      />
      <DialogContent>
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
            </DialogHeader>
            <KeyReveal apiKey={createdKey} />
            <DialogFooter>
              <DialogClose render={<Button variant="primary" />}>
                Done
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {/* Label */}
              <div className="space-y-1.5">
                <Label htmlFor="key-label">Label</Label>
                <Input
                  id="key-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Production"
                  aria-invalid={!!errors.label}
                  aria-describedby={errors.label ? "key-label-error" : undefined}
                />
                {errors.label && (
                  <p
                    id="key-label-error"
                    className="text-xs text-error"
                    role="alert"
                  >
                    {errors.label[0]}
                  </p>
                )}
              </div>

              {/* Rate limit */}
              <div className="space-y-1.5">
                <Label htmlFor="key-rpm">Rate Limit (requests/min)</Label>
                <Input
                  id="key-rpm"
                  type="number"
                  min="1"
                  max="3000"
                  value={rateLimitRpm}
                  onChange={(e) => setRateLimitRpm(e.target.value)}
                  aria-invalid={!!errors.rateLimitRpm}
                  aria-describedby={
                    errors.rateLimitRpm ? "key-rpm-error" : "key-rpm-hint"
                  }
                  className="font-mono tabular"
                />
                {errors.rateLimitRpm ? (
                  <p
                    id="key-rpm-error"
                    className="text-xs text-error"
                    role="alert"
                  >
                    {errors.rateLimitRpm[0]}
                  </p>
                ) : (
                  <p id="key-rpm-hint" className="text-xs text-text-muted">
                    Default 700. Max 3,000 RPM.
                  </p>
                )}
              </div>

              {/* Spend limits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="key-daily">Daily Spend Limit ($)</Label>
                  <Input
                    id="key-daily"
                    type="number"
                    min="0"
                    step="0.01"
                    value={spendLimitDaily}
                    onChange={(e) => setSpendLimitDaily(e.target.value)}
                    placeholder="Optional"
                    aria-invalid={!!errors.spendLimitDaily}
                    aria-describedby={
                      errors.spendLimitDaily ? "key-daily-error" : undefined
                    }
                    className="font-mono tabular"
                  />
                  {errors.spendLimitDaily && (
                    <p
                      id="key-daily-error"
                      className="text-xs text-error"
                      role="alert"
                    >
                      {errors.spendLimitDaily[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="key-monthly">Monthly Limit ($)</Label>
                  <Input
                    id="key-monthly"
                    type="number"
                    min="0"
                    step="0.01"
                    value={spendLimitMonthly}
                    onChange={(e) => setSpendLimitMonthly(e.target.value)}
                    placeholder="Optional"
                    aria-invalid={!!errors.spendLimitMonthly}
                    aria-describedby={
                      errors.spendLimitMonthly
                        ? "key-monthly-error"
                        : undefined
                    }
                    className="font-mono tabular"
                  />
                  {errors.spendLimitMonthly && (
                    <p
                      id="key-monthly-error"
                      className="text-xs text-error"
                      role="alert"
                    >
                      {errors.spendLimitMonthly[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Key
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
