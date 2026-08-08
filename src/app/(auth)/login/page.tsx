"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    const result = await loginAction(data);
    setLoading(false);

    if (!result.ok) {
      if ("errors" in result && result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof LoginInput, {
            message: (messages as string[])[0],
          });
        });
      }
      toast.error(result.message);
      return;
    }

    // Success — redirect happens in server action
    toast.success("Welcome back!");
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-border-default bg-surface p-8">
        <h1 className="mb-2 text-center text-h2 font-semibold">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Sign in to your Ruvicode account.
        </p>

        {/* OAuth buttons — uses client SDK (POST), not <Link> (GET) */}
        <div className="mb-6">
          <OAuthButtons callbackURL="/dashboard" />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-2 text-xs text-text-muted">
              OR
            </span>
          </div>
        </div>

        {/* Email/password form — for users who set a password */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-error">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-error">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          <Link
            href="/forgot-password"
            className="text-accent hover:text-accent-hover"
          >
            Forgot password?
          </Link>
          <span className="mx-2">·</span>
          <Link
            href="/register"
            className="text-accent hover:text-accent-hover"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
