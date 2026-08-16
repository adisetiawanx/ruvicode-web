"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "@/app/(dashboard)/dashboard/settings/actions";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }
    setLoading(true);
    const result = await deleteAccountAction(confirmText);
    setLoading(false);

    if (!result?.ok) {
      toast.error(result?.message ?? "Failed to delete account");
      return;
    }
    // redirect happens server-side
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Delete Account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account?</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDelete}>
            <p className="mb-4 text-sm text-text-secondary">
              This will permanently delete your account, wallet, API keys, and
              all usage data. <strong className="text-error">This cannot be undone.</strong>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm">
                Type <code className="font-mono font-semibold text-error">DELETE</code> to confirm
              </Label>
              <Input
                id="delete-confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
                placeholder="DELETE"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" variant="danger" disabled={loading || confirmText !== "DELETE"}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Permanently
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
