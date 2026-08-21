"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { trackLogin } from "@/lib/analytics";
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
    // Client SDK POSTs directly to /api/auth/sign-in/email so the session
    // cookie reaches the browser. A server action cannot forward the
    // Set-Cookie header reliably in this setup.
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });
    setLoading(false);

    if (error) {
      toast.error(
        error.message ?? "Invalid email or password. Please try again.",
      );
      return;
    }

    trackLogin("email");
    toast.success("Welcome back!");
    window.location.assign("/dashboard");
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
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
