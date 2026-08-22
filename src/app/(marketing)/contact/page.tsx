import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/container";
import {
  PageEntrance,
  PageEntranceItem,
} from "@/components/shared/page-entrance";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Need help with Ruvicode? Email us at support@ruvicode.com and the team will get back to you.",
  alternates: { canonical: "https://ruvicode.com/contact" },
};

export default function ContactPage() {
  return (
    <Container size="wide" className="py-16">
      <PageEntrance>
        <PageEntranceItem>
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent-text">
              Contact
            </p>
            <h1 className="mb-3 text-h1 font-semibold text-text-primary">
              Get in touch
            </h1>
            <p className="text-lg leading-relaxed text-text-secondary">
              Something not working, or have a question about your account?
              Email us and we will help you sort it out.
            </p>
          </div>
        </PageEntranceItem>

        <PageEntranceItem>
          <a
            href="mailto:support@ruvicode.com"
            className="inline-flex items-center gap-4 rounded-xl border border-border-subtle bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2">
              <Mail className="h-5 w-5 text-accent-text" />
            </span>
            <span>
              <span className="block text-sm text-text-secondary">
                Email us at
              </span>
              <span className="block font-mono text-lg text-text-primary">
                support@ruvicode.com
              </span>
            </span>
          </a>
        </PageEntranceItem>
      </PageEntrance>
    </Container>
  );
}
