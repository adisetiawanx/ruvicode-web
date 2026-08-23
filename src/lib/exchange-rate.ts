const FRANKFURTER_URL = "https://api.frankfurter.dev/v2/rate/USD/IDR";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour; the API updates daily

/**
 * USD to IDR exchange rate for the IDR top-up card.
 *
 * Source: Frankfurter (free, no API key, commercial use OK, daily central
 * bank rates). The displayed rate adds a flat IDR 300 markup per USD, so
 * buyers paying in Rupiah cover the conversion spread.
 */

let cached: { rate: number; at: number } | null = null;

export async function getUsdIdrRate(): Promise<number | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.rate;
  }
  try {
    const res = await fetch(FRANKFURTER_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return cached?.rate ?? null;
    const data = (await res.json()) as { rate?: number };
    if (typeof data.rate !== "number" || data.rate <= 0) {
      return cached?.rate ?? null;
    }
    // Markup: the buyer pays IDR 300 more per USD than the mid-market rate.
    const markedUp = data.rate + 300;
    cached = { rate: markedUp, at: Date.now() };
    return markedUp;
  } catch {
    return cached?.rate ?? null;
  }
}
