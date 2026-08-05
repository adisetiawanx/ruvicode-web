import { Container } from "@/components/layout/container";
import { LinkButton } from "@/components/shared/link-button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="mb-4 text-6xl font-bold text-accent">404</p>
      <h1 className="mb-2 text-2xl font-semibold">This page drifted off.</h1>
      <p className="mb-8 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <LinkButton href="/" variant="primary">
          Go Home
        </LinkButton>
        <LinkButton href="/dashboard" variant="outline">
          Go to Dashboard
        </LinkButton>
      </div>
    </Container>
  );
}
