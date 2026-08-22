/** Pricing-page-specific FAQ entries (separate from landing FAQ). */
export const PRICING_FAQS = [
  {
    q: "What does $/1M tokens mean?",
    a: "Pricing is per 1 million tokens. For example, if a model costs $0.22/1M input tokens and you send 10,000 tokens, the input cost is $0.0022. Most requests use far fewer than 1M tokens.",
  },
  {
    q: "Are these prices real-time?",
    a: "Yes. Our pricing engine fetches live marketplace prices every 2 minutes and updates the table accordingly. You always see the current rate, not a stale estimate.",
  },
  {
    q: "How are you cheaper than official provider pricing?",
    a: "We buy inference capacity at market rates, well below official list prices, and pass most of the difference to you. The price you see on each model page is the price you pay per request.",
  },
  {
    q: "Do my credits expire?",
    a: "No. Your wallet balance never expires. Your balance is yours to use whenever you want. No inactivity timeout, no expiry.",
  },
  {
    q: "What happens if a model becomes unavailable?",
    a: "If a model is temporarily unavailable, requests will return an error and you will not be charged. You can switch to another model or retry later.",
  },
  {
    q: "Do cached tokens cost less?",
    a: "Yes. When a request reuses a prompt prefix that was already processed, the cached portion is billed at a cache read rate, typically 5-10x cheaper than the input rate. Caching is automatic and there is nothing to enable. See the cached input rate on each model page.",
  },
  {
    q: "Does prompt caching work with coding agents?",
    a: "Yes, and agents benefit the most. Tools like Claude Code, OpenCode, Cline, and Aider resend the whole conversation on every tool call, so cache hit rates above 95% are normal after the first few turns. One real agent session on our gateway hit 99.7% cached mid-conversation.",
  },
  {
    q: "How much can I save with caching?",
    a: "It depends on how much of your prompt repeats. A mid-session agent request with 99% cache hits paid about 74% less than the same request fully unbilled at the input rate. Short unique prompts see no benefit, repeated prefixes see the most.",
  },
  {
    q: "Can I see how many of my tokens were cached?",
    a: "Yes. Every response's usage object reports the cache split, and your dashboard shows cached tokens per request with the percentage of the prompt they cover. Usage totals and the weekly chart include cached counts too.",
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
    q: "Can I set spending limits per API key?",
    a: "Yes. Every key has its own rate limit and optional daily and monthly spend limits. Requests that would exceed a limit are rejected before they reach the model, so a runaway agent cannot drain your wallet.",
  },
] as const;
