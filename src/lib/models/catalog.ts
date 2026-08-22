/**
 * Curated model catalog (single source of truth).
 *
 * The live market feed syncs 160+ models, but the public catalog only
 * shows this curated list. Brand, type, context window, and max output are
 * assigned here because the upstream feed carries no provider metadata (and
 * the upstream provider identity is masked by design).
 *
 * Context and max-output values verified against vendor docs (Aug 2026):
 *   Anthropic  — platform.claude.com/docs/en/build-with-claude/context-windows
 *   OpenAI     — developers.openai.com/api/docs/models/*
 *   Google     — ai.google.dev/gemini-api/docs/models/*
 *   DeepSeek   — deepseek.com/en/news/v4-preview + contextwindows.dev
 *   Z.ai       — docs.z.ai/guides/llm/glm-5.{1,2}
 *   xAI        — docs.x.ai/developers/models/grok-4.{3,5}
 *   Moonshot   — platform.kimi.ai/docs/models
 *   MiniMax    — docs.api.nvidia.com/nim (204,800 context)
 *
 * To add a model: make sure the slug exists in `model_prices` (the pricing
 * worker syncs it), then add an entry here.
 */

export interface CuratedModel {
  /** Slug as used in the API and the model_prices table. */
  slug: string;
  /** Human-facing name. */
  name: string;
  /** Brand shown in the UI (derived from the slug family). */
  brand: string;
  /** Capability tags used by the type filter. */
  types: ModelType[];
  /** Context window in tokens (verified against vendor docs, Aug 2026). */
  context: number;
  /** Max output tokens (verified against vendor docs, Aug 2026). */
  maxOutput: number;
}

export type ModelType = "text" | "vision" | "reasoning" | "tools" | "code";

export const MODEL_TYPES: ModelType[] = [
  "text",
  "reasoning",
  "vision",
  "tools",
  "code",
];

const c = (
  slug: string,
  name: string,
  brand: string,
  types: ModelType[],
  context: number,
  maxOutput: number,
): CuratedModel => ({ slug, name, brand, types, context, maxOutput });

export const CURATED_MODELS: CuratedModel[] = [
  // ── Anthropic ──
  c("claude-opus-5", "Claude Opus 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("claude-opus-4.8", "Claude Opus 4.8", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("claude-opus-4.7", "Claude Opus 4.7", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("claude-opus-4.6", "Claude Opus 4.6", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("claude-opus-4.5", "Claude Opus 4.5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 200_000, 64_000),
  c("claude-sonnet-5", "Claude Sonnet 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("claude-sonnet-4.5", "Claude Sonnet 4.5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 200_000, 64_000),
  c("claude-haiku-4.5", "Claude Haiku 4.5", "Anthropic", ["text", "vision", "tools", "code"], 200_000, 64_000),
  c("claude-fable-5", "Claude Fable 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),

  // ── OpenAI ──
  c("gpt-5.6-sol", "GPT-5.6 Sol", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.6-sol-pro", "GPT-5.6 Sol Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.6-terra", "GPT-5.6 Terra", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.6-terra-pro", "GPT-5.6 Terra Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.6-luna", "GPT-5.6 Luna", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.6-luna-pro", "GPT-5.6 Luna Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.5", "GPT-5.5", "OpenAI", ["text", "vision", "reasoning", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.4", "GPT-5.4", "OpenAI", ["text", "vision", "tools", "code"], 1_050_000, 128_000),
  c("gpt-5.4-mini", "GPT-5.4 Mini", "OpenAI", ["text", "vision", "tools", "code"], 400_000, 128_000),

  // ── Google ──
  c("gemini-3-5-flash", "Gemini 3.5 Flash", "Google", ["text", "vision", "reasoning", "tools", "code"], 1_048_576, 64_000),
  c("gemini-3.1-pro-preview", "Gemini 3.1 Pro", "Google", ["text", "vision", "reasoning", "tools", "code"], 1_048_576, 64_000),

  // ── DeepSeek ──
  c("deepseek-v4-flash", "DeepSeek V4 Flash", "DeepSeek", ["text", "reasoning", "tools", "code"], 1_048_576, 384_000),
  c("deepseek-v4-flash-0731", "DeepSeek V4 Flash 0731", "DeepSeek", ["text", "reasoning", "tools", "code"], 1_048_576, 384_000),
  c("deepseek-v4-pro", "DeepSeek V4 Pro", "DeepSeek", ["text", "reasoning", "tools", "code"], 1_048_576, 384_000),

  // ── Z.ai ──
  c("glm-5.1", "GLM-5.1", "Z.ai", ["text", "reasoning", "tools", "code"], 200_000, 128_000),
  c("glm-5.2", "GLM-5.2", "Z.ai", ["text", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("glm-5.3", "GLM-5.3", "Z.ai", ["text", "reasoning", "tools", "code"], 1_000_000, 128_000),

  // ── xAI ──
  c("grok-4.5", "Grok 4.5", "xAI", ["text", "vision", "reasoning", "tools", "code"], 500_000, 128_000),
  c("grok-4.3", "Grok 4.3", "xAI", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),

  // ── Moonshot ──
  c("kimi-k3", "Kimi K3", "Moonshot", ["text", "vision", "reasoning", "tools", "code"], 1_000_000, 128_000),
  c("kimi-k2.5", "Kimi K2.5", "Moonshot", ["text", "vision", "reasoning", "tools", "code"], 256_000, 128_000),
  c("kimi-k2.6", "Kimi K2.6", "Moonshot", ["text", "vision", "reasoning", "tools", "code"], 256_000, 128_000),
  c("kimi-k2.7-code", "Kimi K2.7 Code", "Moonshot", ["text", "vision", "tools", "code"], 256_000, 128_000),

  // ── MiniMax ──
  c("minimax-m2.5", "MiniMax M2.5", "MiniMax", ["text", "reasoning", "tools", "code"], 204_800, 128_000),
  c("minimax-m2.7", "MiniMax M2.7", "MiniMax", ["text", "reasoning", "tools", "code"], 204_800, 128_000),
];

/** Slug allowlist used by the DB queries. */
export const CURATED_SLUGS = CURATED_MODELS.map((m) => m.slug);

/** Lookup by slug. */
export function getCuratedModel(slug: string): CuratedModel | undefined {
  return CURATED_MODELS.find((m) => m.slug === slug);
}

/** Distinct brands, alphabetically. */
export function getBrands(): string[] {
  return [...new Set(CURATED_MODELS.map((m) => m.brand))].sort();
}

/**
 * Format a token count for display, following the OpenRouter convention:
 * millions with up to 2 significant decimals ("1M", "1.05M"), thousands
 * below that ("256K", "205K"). Never shows "1.0M" or rounds 1.05M up to 1.1M.
 */
export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) {
    const m = Math.round((tokens / 1_000_000) * 100) / 100;
    return `${m}M`;
  }
  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}K`;
  }
  return String(tokens);
}
