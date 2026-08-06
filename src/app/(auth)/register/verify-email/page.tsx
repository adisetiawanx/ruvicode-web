import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Your Email | Ruvicode",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="rounded-lg border border-border-default bg-surface p-8">
        <Mail className="mx-auto mb-4 h-12 w-12 text-accent" />
        <h1 className="mb-2 text-h2 font-semibold">Check your email</h1>
        <p className="mb-6 text-text-secondary">
          We&apos;ve sent a verification link to your email address. Click the
          link to activate your account.
        </p>
        <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/api/auth/send-verification-email" />}>
          <Mail className="mr-2 h-4 w-4" /> Resend verification email
        </Button>
        <p className="mt-4 text-xs text-text-muted">
          Didn&apos;t receive an email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}
