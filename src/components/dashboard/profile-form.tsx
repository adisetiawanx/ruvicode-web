"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/app/(dashboard)/dashboard/settings/actions";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
  emailVerified: boolean;
}

export function ProfileForm({
  initialName,
  initialEmail,
  emailVerified,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateProfileAction({ name });

    setLoading(false);

    if (!result.ok) {
      if (result.errors?.name?.[0]) {
        setError(result.errors.name[0]);
      }
      toast.error(result.message);
      return;
    }

    toast.success("Settings saved");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="settings-name">Name</Label>
        <Input
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "settings-name-error" : undefined}
        />
        {error && (
          <p
            id="settings-name-error"
            className="text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="settings-email">Email</Label>
        <Input
          id="settings-email"
          value={initialEmail}
          disabled
          className="opacity-60"
        />
        <p className="text-xs text-text-muted">
          {emailVerified ? "✓ Verified" : "Not verified"} · Email changes
          require re-verification
        </p>
      </div>

      <Button type="submit" variant="primary" size="sm" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Changes
      </Button>
    </form>
  );
}
