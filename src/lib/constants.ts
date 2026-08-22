/**
 * Shared application constants.
 * FAQ data lives here so it can be reused by both the FAQ component
 * and the JSON-LD FAQPage structured data (single source of truth).
 */

export const FAQS = [
  {
    q: "How is Ruvicode cheaper than official provider pricing?",
    a: "We buy inference capacity at market rates, well below what the official APIs charge, and pass most of the difference to you. The price you see on each model page is the price you pay per request.",
  },
  {
    q: "Do cached tokens cost less?",
    a: "Yes. When a request reuses a prompt prefix that was already processed, the cached portion is billed at a cache read rate, typically 5-10x cheaper than the input rate. Caching is automatic and there is nothing to enable.",
  },
  {
    q: "Does prompt caching work with coding agents?",
    a: "Yes, and agents benefit the most. Tools like Claude Code, OpenCode, Cline, and Aider resend the whole conversation on every tool call, so cache hit rates above 95% are normal after the first few turns. One real agent session on our gateway hit 99.7% cached mid-conversation.",
  },
  {
    q: "How much can I save with caching?",
    a: "It depends on how much of your prompt repeats. A mid-session agent request with 99% cache hits paid about 74% less than the same request at the full input rate. Short unique prompts see no benefit, repeated prefixes see the most.",
  },
  {
    q: "Can I see how many of my tokens were cached?",
    a: "Yes. Every response's usage object reports the cache split, and your dashboard shows cached tokens per request with the percentage of the prompt they cover. Usage totals and the weekly chart include cached counts too.",
  },
  {
    q: "Do you store my prompts or responses?",
    a: "No. We do not log or store the content of your prompts or AI responses. Only usage metadata (token counts, cost, model) is retained for billing.",
  },
  {
    q: "Do you support streaming?",
    a: "Yes. Streaming works out of the box with the OpenAI-compatible API, including usage reporting in the final chunk and cached token counts. Point any OpenAI SDK at our base URL and set stream to true.",
  },
  {
    q: "What happens if my request fails mid-stream?",
    a: "You are charged only for what the usage object reports. If a stream is canceled before usage arrives, the request settles at zero cost. Failed requests never consume your balance.",
  },
  {
    q: "Can I set spending limits per key?",
    a: "Yes. Every API key can have daily and monthly spend caps. When a limit is hit, the key stops accepting requests until the next period. You can also set per-key rate limits up to 3,000 RPM.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept global credit and debit cards and USDC deposits on the Base network. Top up once, pay per request. Your balance never expires.",
  },
  {
    q: "Is it OpenAI-compatible?",
    a: "Yes. Our API endpoint is fully OpenAI-compatible. Point any OpenAI SDK, Cursor, Aider, LangChain, or similar tool at our base URL with your Ruvicode API key.",
  },
  {
    q: "Do my credits expire?",
    a: "No. Your wallet balance never expires. Your balance is yours to use whenever you want. No inactivity timeout, no expiry.",
  },
] as const;

export const STATS = [
  { value: "30+", label: "AI Models" },
  { value: "99%", label: "Up to vs official" },
  { value: "$0", label: "Hidden Fees" },
  { value: "3,000", label: "RPM per key" },
] as const;

interface ShowcaseModel {
  model: string;
  display_name: string;
  provider: string;
  user_input: number;
  user_output: number;
  ref_input: number;
  context: string;
  savings_pct: number;
}

/** Static top models for the showcase (MVP, replaced by DB in later ADR).
 *  Pricing data from PROJECT.md verified margin table. */
export const SHOWCASE_MODELS: readonly ShowcaseModel[] = [
  {
    model: "claude-opus-4.7",
    display_name: "Claude Opus 4.7",
    provider: "Anthropic",
    user_input: 3.95,
    user_output: 19.75,
    ref_input: 5.0,
    context: "200K",
    savings_pct: 21,
  },
  {
    model: "claude-sonnet-5",
    display_name: "Claude Sonnet 5",
    provider: "Anthropic",
    user_input: 1.7,
    user_output: 8.5,
    ref_input: 2.0,
    context: "200K",
    savings_pct: 15,
  },
  {
    model: "gpt-5.6-sol",
    display_name: "GPT-5.6-Sol",
    provider: "OpenAI",
    user_input: 1.15,
    user_output: 4.6,
    ref_input: 5.0,
    context: "128K",
    savings_pct: 77,
  },
  {
    model: "gpt-5.4",
    display_name: "GPT-5.4",
    provider: "OpenAI",
    user_input: 1.0,
    user_output: 4.0,
    ref_input: 2.5,
    context: "128K",
    savings_pct: 60,
  },
  {
    model: "gemini-3.1-pro",
    display_name: "Gemini 3.1 Pro",
    provider: "Google",
    user_input: 1.39,
    user_output: 5.56,
    ref_input: 2.0,
    context: "1M",
    savings_pct: 31,
  },
  {
    model: "glm-5.2",
    display_name: "GLM-5.2",
    provider: "Zhipu",
    user_input: 0.218,
    user_output: 0.872,
    ref_input: 0.95,
    context: "128K",
    savings_pct: 77,
  },
  {
    model: "kimi-k3",
    display_name: "Kimi K3",
    provider: "Moonshot",
    user_input: 2.05,
    user_output: 8.2,
    ref_input: 3.0,
    context: "256K",
    savings_pct: 32,
  },
  {
    model: "deepseek-v4-flash",
    display_name: "DeepSeek V4 Flash",
    provider: "DeepSeek",
    user_input: 0.027,
    user_output: 0.108,
    ref_input: 0.09,
    context: "64K",
    savings_pct: 70,
  },
] as const;

// Common disposable email domains, blocked at registration
export const DISPOSABLE_EMAIL_DOMAINS = [
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "throwawaymail.com",
  "yopmail.com",
  "getnada.com",
  "temp-mail.org",
  "sharklasers.com",
  "guerrillamailblock.com",
  "spam.com",
  "trashmail.com",
  "fakeinbox.com",
  "mailcatch.com",
  "dispostable.com",
  "mintemail.com",
];

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
}

// Chart colors

export const CHART_COLORS = {
  primary: "#D97757",
  secondary: "#6A9BCC",
  tertiary: "#8FA876",
  quaternary: "#D4A27F",
  quinary: "#C46686",
  sextary: "#B58AB8",
  septary: "#7FB8A4",
  octonary: "#E0B050",
  nonary: "#8B7FC7",
  denary: "#C98B6B",
  undenary: "#6BA3C9",
  duodenary: "#A89070",
} as const;

export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
  CHART_COLORS.sextary,
  CHART_COLORS.septary,
  CHART_COLORS.octonary,
  CHART_COLORS.nonary,
  CHART_COLORS.denary,
  CHART_COLORS.undenary,
  CHART_COLORS.duodenary,
] as const;

/** Map a zero-based index to a chart color, cycling through the palette. */
export function getChartColor(index: number): string {
  return CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length] ?? CHART_COLORS.primary;
}
