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
] as const;
