import Link from "next/link";
import { Container } from "./container";
import { Logo } from "@/components/shared/logo";

const footerLinks = {
  Product: [
    { href: "/models", label: "Models" },
    { href: "/playground", label: "Playground" },
    { href: "/calculator", label: "Calculator" },
    { href: "/docs", label: "Documentation" },
  ],
  Company: [
    { href: "/status", label: "Status" },
    { href: "/integrations", label: "Integrations" },
    { href: "/blog", label: "Blog" },
  ],
  Legal: [
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/legal/terms", label: "Terms of Service" },
    { href: "/legal/refund", label: "Refund Policy" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-canvas">
      <Container size="wide">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Logo />
              <span className="text-lg font-semibold">Ruvicode</span>
            </div>
            <p className="max-w-[240px] text-sm text-text-secondary">
              Transparent AI API gateway. One key, every model, real
              per-request pricing.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border-subtle py-6 md:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Ruvicode. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Operated by Adi, Sole Trader, Indonesia.
          </p>
        </div>
      </Container>
    </footer>
  );
}
