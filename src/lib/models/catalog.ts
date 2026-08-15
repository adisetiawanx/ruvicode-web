/**
 * Curated model catalog (single source of truth).
 *
 * The live market feed syncs 160+ models, but the public catalog only
 * shows this curated list. Brand and type are assigned here because the
 * upstream feed carries no provider metadata (and the upstream provider
 * identity is masked by design).
 *
 * Capability tags verified against vendor docs (Aug 2026): DeepSeek V4
 * and GLM-5 are text-only (no image input), Kimi K2.5+ carry the MoonViT
 * vision encoder (native multimodal), Grok 4.5 accepts image input,
 * MiniMax M2 is text with deep tool-use.
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
): CuratedModel => ({ slug, name, brand, types });

export const CURATED_MODELS: CuratedModel[] = [
  // ── Anthropic ──
  c("claude-opus-5", "Claude Opus 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-opus-4.8", "Claude Opus 4.8", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-opus-4.7", "Claude Opus 4.7", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-opus-4.6", "Claude Opus 4.6", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-opus-4.5", "Claude Opus 4.5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-sonnet-5", "Claude Sonnet 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-sonnet-4.5", "Claude Sonnet 4.5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),
  c("claude-haiku-4.5", "Claude Haiku 4.5", "Anthropic", ["text", "vision", "tools", "code"]),
  c("claude-fable-5", "Claude Fable 5", "Anthropic", ["text", "vision", "reasoning", "tools", "code"]),

  // ── OpenAI ──
  c("gpt-5.6-sol", "GPT-5.6 Sol", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.6-sol-pro", "GPT-5.6 Sol Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.6-terra", "GPT-5.6 Terra", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.6-terra-pro", "GPT-5.6 Terra Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.6-luna", "GPT-5.6 Luna", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.6-luna-pro", "GPT-5.6 Luna Pro", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.5", "GPT-5.5", "OpenAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("gpt-5.4", "GPT-5.4", "OpenAI", ["text", "vision", "tools", "code"]),
  c("gpt-5.4-mini", "GPT-5.4 Mini", "OpenAI", ["text", "vision", "tools", "code"]),

  // ── Google ──
  c("gemini-3-5-flash", "Gemini 3.5 Flash", "Google", ["text", "vision", "reasoning", "tools", "code"]),
  c("gemini-3.1-pro-preview", "Gemini 3.1 Pro", "Google", ["text", "vision", "reasoning", "tools", "code"]),

  // ── DeepSeek ──
  c("deepseek-v4-flash", "DeepSeek V4 Flash", "DeepSeek", ["text", "reasoning", "tools", "code"]),
  c("deepseek-v4-flash-0731", "DeepSeek V4 Flash 0731", "DeepSeek", ["text", "reasoning", "tools", "code"]),
  c("deepseek-v4-pro", "DeepSeek V4 Pro", "DeepSeek", ["text", "reasoning", "tools", "code"]),

  // ── Z.ai ──
  c("glm-5.1", "GLM-5.1", "Z.ai", ["text", "reasoning", "tools", "code"]),
  c("glm-5.2", "GLM-5.2", "Z.ai", ["text", "reasoning", "tools", "code"]),

  // ── xAI ──
  c("grok-4.5", "Grok 4.5", "xAI", ["text", "vision", "reasoning", "tools", "code"]),
  c("grok-4.3", "Grok 4.3", "xAI", ["text", "vision", "reasoning", "tools", "code"]),

  // ── Moonshot ──
  c("kimi-k3", "Kimi K3", "Moonshot", ["text", "vision", "reasoning", "tools", "code"]),
  c("kimi-k2.5", "Kimi K2.5", "Moonshot", ["text", "vision", "reasoning", "tools", "code"]),
  c("kimi-k2.6", "Kimi K2.6", "Moonshot", ["text", "vision", "reasoning", "tools", "code"]),
  c("kimi-k2.7-code", "Kimi K2.7 Code", "Moonshot", ["text", "vision", "tools", "code"]),

  // ── MiniMax ──
  c("minimax-m2.5", "MiniMax M2.5", "MiniMax", ["text", "reasoning", "tools", "code"]),
  c("minimax-m2.7", "MiniMax M2.7", "MiniMax", ["text", "reasoning", "tools", "code"]),
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
