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
- MDX for the blog and documentation

## Features

- OAuth-first sign in with Google and GitHub. Email and password login for users who set a password.
- Wallet top-up by card through Paddle, and by USDC deposit on the Base network.
- API key management with per-key rate limits and daily and monthly spend caps.
- Usage history with filters, charts, and CSV export.
- Billing history and account settings.
- Live model catalog with transparent per-model pricing.
- Public playground and cost calculator.
- Blog and documentation rendered from MDX.
- Full SEO support with sitemap, robots, structured data, and per-page metadata.

## Repository Layout

- `src/app/(marketing)` public marketing pages
- `src/app/(auth)` sign in and registration
- `src/app/(dashboard)` the customer dashboard
- `src/app/(legal)` privacy, terms, and refund policies
- `src/components` shared UI and feature components
- `src/lib` database, auth, email, validation, and utility modules
- `content/blog` and `content/docs` MDX source files
- `drizzle` database migrations and seed data

## Getting Started

Prerequisites are Node.js 22, pnpm, and Docker for PostgreSQL and Redis.

```bash
pnpm install
docker compose up -d
cp .env.example .env.local
pnpm db:migrate
pnpm dev
```

The dashboard runs at `http://localhost:3000`.

Environment variables are validated with `@t3-oss/env-nextjs` and declared in `.env.example`. OAuth client IDs for Google and GitHub, a Paddle API key, and a Resend API key are all optional for local development.

## Design

The interface uses a warm dark theme with a clay terracotta accent and the Geist type family. Financial values render in monospace and tabular figures. Motion is restrained and accessibility targets WCAG 2.1 AA.
