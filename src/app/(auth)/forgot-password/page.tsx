"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { forgotPasswordAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true);
    const result = await forgotPasswordAction(data);
    setLoading(false);

    if (!result.ok) {
      if ("errors" in result && result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof ForgotPasswordInput, {
            message: (messages as string[])[0],
          });
        });
      }
      toast.error(result.message);
      return;
    }

    // Always show success — prevents user enumeration
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border-default bg-surface p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
          <h1 className="mb-2 text-h2 font-semibold">Check your email</h1>
          <p className="mb-6 text-text-secondary">
            If an account exists for that email, we&apos;ve sent a link to set
            or reset your password. Check your spam folder if you don&apos;t
            see it.
          </p>
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-border-default bg-surface p-8">
        <h1 className="mb-2 text-center text-h2 font-semibold">
          Forgot password
        </h1>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a link to set or reset your
          password.
        </p>

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

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send reset link
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-accent hover:text-accent-hover"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
