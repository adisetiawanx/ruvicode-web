import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS — only applied in production (see headers() condition below)
];

const config: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // HSTS only on HTTPS (production) — avoids issues on localhost HTTP dev
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
        // This runs in production behind Caddy (TLS-terminating reverse proxy)
        // In dev (HTTP localhost) the browser ignores HSTS anyway
        has: [{ type: "header", key: "X-Forwarded-Proto", value: "https" }],
      },
    ];
  },
};

export default config;
