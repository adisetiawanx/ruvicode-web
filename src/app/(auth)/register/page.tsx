"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { registerAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    const result = await registerAction(data);
    setLoading(false);

    if (!result.ok) {
      // Set inline field errors from server validation
      if ("errors" in result && result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (field !== "website") {
            // Don't reveal honeypot
            form.setError(field as keyof RegisterInput, {
              message: (messages as string[])[0],
            });
          }
        });
      }
      toast.error(result.message);
      return;
    }

    // Success — redirect happens in server action
    toast.success("Account created! Check your email to verify.");
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-border-default bg-surface p-8">
        <h1 className="mb-2 text-center text-h2 font-semibold">
          Create your account
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Start using 20+ AI models with one API key.
        </p>

        {/* OAuth buttons */}
        <div className="mb-6 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={
              <a href="/api/auth/signin/social/google" />
            }
          >
            <Mail className="mr-2 h-4 w-4" /> Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={
              <a href="/api/auth/signin/social/github" />
            }
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/></svg> Continue with GitHub
          </Button>
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

        {/* Email/password form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Honeypot field — hidden from real users */}
          <div className="hidden" aria-hidden="true">
            <label>Website (leave empty)</label>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...form.register("website")}
            />
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-xs text-error">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

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
              autoComplete="new-password"
              placeholder="Min 8 characters, 1 letter, 1 number"
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
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-hover"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-text-muted">
        By signing up, you agree to our{" "}
        <Link
          href="/legal/terms"
          className="underline hover:text-text-secondary"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="underline hover:text-text-secondary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
