import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="mb-4 text-6xl font-bold text-accent">404</p>
      <h1 className="mb-2 text-2xl font-semibold">This page drifted off.</h1>
      <p className="mb-8 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" render={<Link href="/" />}>
          Go Home
        </Button>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Go to Dashboard
        </Button>
      </div>
    </Container>
  );
}
