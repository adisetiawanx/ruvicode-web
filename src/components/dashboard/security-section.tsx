"use client";

import { useState } from "react";
import { Loader2, Lock, Key, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordAction,
  setPasswordAction,
} from "@/app/(dashboard)/dashboard/settings/actions";

interface SecuritySectionProps {
  hasPassword: boolean;
  linkedProviders: string[];
}

export function SecuritySection({
  hasPassword,
  linkedProviders,
}: SecuritySectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await changePasswordAction({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setLoading(false);

    if (!result.ok) {
      if ("errors" in result && result.errors) {
        if (result.errors.currentPassword?.[0]) {
          toast.error(result.errors.currentPassword[0]);
        }
        if (result.errors.newPassword?.[0]) {
          toast.error(result.errors.newPassword[0]);
        }
        if (result.errors.confirmPassword?.[0]) {
          toast.error(result.errors.confirmPassword[0]);
        }
      }
      toast.error(result.message);
      return;
    }

    toast.success("Password updated");
    setShowForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await setPasswordAction({
      newPassword,
      confirmPassword,
    });

    setLoading(false);

    if (!result.ok) {
      if ("errors" in result && result.errors) {
        if (result.errors.newPassword?.[0]) {
          toast.error(result.errors.newPassword[0]);
        }
        if (result.errors.confirmPassword?.[0]) {
          toast.error(result.errors.confirmPassword[0]);
        }
      }
      toast.error(result.message);
      return;
    }

    toast.success("Password set! You can now sign in with email and password.");
    setShowForm(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-4">
      {/* Linked providers */}
      <div>
        <p className="mb-2 text-sm text-text-secondary">Login methods</p>
        <div className="space-y-2">
          {linkedProviders.includes("google") && (
            <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-2 px-3 py-2">
              <Mail className="h-4 w-4 text-accent" />
              <span className="text-sm text-text-primary">Google</span>
              <Check className="ml-auto h-4 w-4 text-success" />
            </div>
          )}
          {linkedProviders.includes("github") && (
            <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-2 px-3 py-2">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/></svg>
              <span className="text-sm text-text-primary">GitHub</span>
              <Check className="ml-auto h-4 w-4 text-success" />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-2 px-3 py-2">
            <Key className="h-4 w-4 text-accent" />
            <span className="text-sm text-text-primary">
              Email &amp; Password
            </span>
            {hasPassword ? (
              <Check className="ml-auto h-4 w-4 text-success" />
            ) : (
              <span className="ml-auto text-xs text-text-muted">
                Not set
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Password section */}
      {hasPassword ? (
        <div>
          {!showForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 8 characters, 1 letter, 1 number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-password">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Update Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="rounded-md border border-border-subtle bg-canvas p-4">
          <p className="mb-2 text-sm text-text-secondary">
            You can also sign in with email and password.
          </p>
          <p className="mb-3 text-xs text-text-muted">
            Set a password to have an alternative login method if you lose
            access to your OAuth provider.
          </p>
          {!showForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Set Password
            </Button>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="set-new-password">New Password</Label>
                <Input
                  id="set-new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 8 characters, 1 letter, 1 number"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-confirm-password">Confirm Password</Label>
                <Input
                  id="set-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Set Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
