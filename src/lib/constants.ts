/**
 * Shared application constants.
 * FAQ data lives here so it can be reused by both the FAQ component
 * and the JSON-LD FAQPage structured data (single source of truth).
 */

export const FAQS = [
  {
    q: "How is Ruvicode cheaper than OpenRouter?",
    a: "We source model capacity through a decentralized marketplace that offers significant discounts. Our dynamic pricing engine passes most of those savings to you while maintaining a small margin.",
  },
  {
    q: "Do you store my prompts?",
    a: "No. We do not log or store the content of your prompts or AI responses by default. Only usage metadata (token counts, cost, model) is retained for billing.",
  },
  {
    q: "Can I set spending limits?",
    a: "Yes. Every API key can have daily and monthly spend caps. When a limit is hit, the key is automatically suspended until the next period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept global credit and debit cards via Paddle (our payment processor), and USDC cryptocurrency deposits on the Base network.",
  },
  {
    q: "Is it OpenAI-compatible?",
    a: "Yes. Our API endpoint is fully OpenAI-compatible. Point any OpenAI SDK, Cursor, Aider, LangChain, or similar tool at our base URL with your Ruvicode API key.",
  },
] as const;

export const STATS = [
  { value: "20+", label: "AI Models" },
  { value: "77%", label: "Cheaper vs OpenRouter" },
  { value: "$0", label: "Hidden Fees" },
  { value: "30K", label: "Requests/min Capacity" },
] as const;

/** Static top models for the showcase (MVP — replaced by DB in later ADR). */
export const SHOWCASE_MODELS = [
  { model: "claude-opus-4.7", display_name: "Claude Opus 4.7", user_input: 3.95 },
  { model: "claude-sonnet-5", display_name: "Claude Sonnet 5", user_input: 1.7 },
  { model: "gpt-5.6-sol", display_name: "GPT-5.6-Sol", user_input: 1.15 },
  { model: "gpt-5.4", display_name: "GPT-5.4", user_input: 1.0 },
  { model: "gemini-3.1-pro", display_name: "Gemini 3.1 Pro", user_input: 1.39 },
  { model: "glm-5.2", display_name: "GLM-5.2", user_input: 0.218 },
  { model: "kimi-k3", display_name: "Kimi K3", user_input: 2.05 },
  { model: "deepseek-v4-flash", display_name: "DeepSeek V4 Flash", user_input: 0.027 },
] as const;
