# Ruvicode Web

Ruvicode is a transparent AI API gateway. One API key, one OpenAI-compatible endpoint, and access to many frontier and open AI models through a single wallet. Real per-request pricing, hard spend limits, and no credit expiry.

This repository is the Next.js web application. It contains the marketing site, authentication, and the customer dashboard where developers top up their wallet, manage API keys, monitor usage, and review billing.

## Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS v4
- Base UI for accessible primitives
- Drizzle ORM with PostgreSQL
- Better Auth for OAuth-first authentication
- Paddle for card payment checkout
- Resend for transactional email
- Recharts for usage charts
- MDX for the blog and documentation, with Shiki server-side syntax highlighting in both light and dark palettes

## Features

- OAuth-first sign in with Google and GitHub. Email and password login for users who set a password.
- Wallet top-up by card through Paddle, and by USDC deposit on the Base network.
- API key management with per-key rate limits and daily and monthly spend caps.
- Usage history with filters, charts, and CSV export.
- Billing history and account settings.
- A curated model catalog. The live market feed syncs 160+ models, the public catalog shows a hand-picked flagship list with live pricing, brand filters, capability filters, and pagination.
- A free public playground, no account needed, running on its own dedicated model so free traffic never touches billed requests. Fair-use throttling stops scripted abuse.
- A dashboard playground that bills the user's own API key with its rate and spend limits applied.
- Cost calculator, integrations guide, and status page.
- Blog and documentation rendered from MDX.
- A Ctrl+K command palette so every page is reachable from anywhere.
- Full SEO support with sitemap, robots, structured data, and per-page metadata.

## Repository Layout

- `src/app/(marketing)` public marketing pages
- `src/app/(auth)` sign in and registration
- `src/app/(dashboard)` the customer dashboard
- `src/app/(legal)` privacy, terms, and refund policies
- `src/app/api/playground` public playground route (provider-direct, masked)
- `src/app/api/dashboard/playground` dashboard playground route (proxies the gateway)
- `src/components` shared UI and feature components
- `src/lib` database, auth, email, validation, and utility modules
- `src/lib/models/catalog.ts` the curated model list, single source of truth
- `content/blog` and `content/docs` MDX source files
- `drizzle` database migrations and seed data
- `scripts` end-to-end verification scripts used during development

## Getting Started

Prerequisites are Node.js 22 and pnpm. The app needs a PostgreSQL and a Redis instance. These are shared infrastructure across the Ruvicode services and are intentionally not bundled in this repository. Start your own instances (or reuse existing ones) and point `DATABASE_URL` and `REDIS_URL` at them in `.env.local`.

```bash
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

The dashboard runs at `http://localhost:3000`.

Environment variables are validated with `@t3-oss/env-nextjs` and declared in `.env.example`. OAuth client IDs for Google and GitHub, a Paddle API key, and a Resend API key are all optional for local development.

## Notes on data freshness

Pages that read live prices (the model catalog, the landing showcase) are rendered per request and never prerendered at build time. The build container has no database access, and baking pages at build time would freeze the static fallback data into the output. Model detail pages render on demand with ISR.

## Design

The interface uses a warm dark theme with a clay terracotta accent and the Geist type family. Financial values render in monospace and tabular figures. Motion is restrained and accessibility targets WCAG 2.1 AA.
