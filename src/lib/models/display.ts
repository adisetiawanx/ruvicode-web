/**
 * Human-facing model names.
 *
 * Model ids arrive as slugs ("deepseek-v4-flash", "glm-5.2"); display
 * should read like the vendor's name ("DeepSeek V4 Flash", "GLM-5.2").
 * Shared by the dashboard tables, the playground, and anywhere a raw
 * model id would otherwise leak to the UI.
 */

const UPPERCASE_BRANDS = ["glm", "gpt", "ai", "usd", "api", "v4", "k2", "k3"];

export function displayModelName(id: string): string {
  return id
    .split(/[-\s]+/)
    .map((part) => {
      const lower = part.toLowerCase();
      if (UPPERCASE_BRANDS.includes(lower)) return part.toUpperCase();
      // keep version digits/decimals as-is ("5.2", "0731")
      if (/^[0-9.]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ")
    .replace(/\bDeepseek\b/g, "DeepSeek")
    .replace(/\bGlm\b/g, "GLM");
}

/**
 * Floor a USD amount to 2 decimals for display. Wallet balances must never
 * round up: a $15.00 balance with $0.000155 of usage reads as $14.99, not
 * $15.00, so users always see money they can actually spend.
 */
export function floorUsd(value: number | string, decimals = 2): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.floor(n * factor) / factor;
}

/**
 * Format a per-1M USD rate for display with enough precision for cheap
 * cache read rates. Expands decimals when the value would otherwise round
 * to $0.00, so a $0.0047 cache rate never renders as "$0.00".
 */
export function formatRate(value: number): string {
  const v = Math.max(0, value);
  if (v >= 0.01) return v.toFixed(2);
  if (v >= 0.001) return v.toFixed(3);
  if (v > 0) return v.toFixed(4);
  return "0.00";
}
