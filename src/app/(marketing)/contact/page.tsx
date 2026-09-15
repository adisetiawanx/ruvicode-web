import type { Metadata } from "next";
import { Mail, Send } from "lucide-react";
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

        <PageEntranceItem>
          <a
            href="https://t.me/asvmv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 rounded-xl border border-border-subtle bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2">
              <Send className="h-5 w-5 text-accent-text" />
            </span>
            <span>
              <span className="block text-sm text-text-secondary">
                Chat with us on Telegram
              </span>
              <span className="block font-mono text-lg text-text-primary">
                @asvmv
              </span>
            </span>
          </a>
        </PageEntranceItem>

        <PageEntranceItem>
          <a
            href="https://www.facebook.com/ruvicode"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 rounded-xl border border-border-subtle bg-surface p-6 transition-colors hover:border-accent/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2">
              <svg viewBox="0 0 24 24" fill="#1877F2" className="h-5 w-5" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
              </svg>
            </span>
            <span>
              <span className="block text-sm text-text-secondary">
                Message us on Facebook
              </span>
              <span className="block font-mono text-lg text-text-primary">
                facebook.com/ruvicode
              </span>
            </span>
          </a>
        </PageEntranceItem>
      </PageEntrance>
    </Container>
  );
}
