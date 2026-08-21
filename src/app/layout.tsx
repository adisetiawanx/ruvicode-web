import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ruvicode - One API Key, Every AI Model",
    template: "%s - Ruvicode",
  },
  description:
    "Transparent AI API gateway. Access Claude, GPT, Gemini, GLM, DeepSeek and more with one key. Real per-request pricing, hard spend limits.",
  metadataBase: new URL("https://ruvicode.com"),
  manifest: "/manifest.webmanifest",
  applicationName: "Ruvicode",
  appleWebApp: {
    capable: true,
    title: "Ruvicode",
  },
  icons: {
    icon: [{ url: "/ruvicode-favicon.ico", sizes: "any" }],
  },
};

const GTAG_ID = "G-12NK6YS2K1";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* No-FOUC theme script — must run BEFORE hydration.
            Also tags the document with a `js` class so globals.css can
            keep SSR content visible for crawlers that never run JS
            (they see no `js` class, so the opacity overrides kick in). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.add('js');
                try {
                  var stored = localStorage.getItem('ruvicode-theme');
                  var theme = stored || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-canvas font-sans text-text-primary">
        {/* Google tag (gtag.js) — Google Ads conversion tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GTAG_ID}');
          `}
        </Script>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-0 focus:top-0 focus:z-[100] focus:rounded-br-md focus:bg-accent focus:px-4 focus:py-2 focus:text-text-inverse focus:transition-all"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
