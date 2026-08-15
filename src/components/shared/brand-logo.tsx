import Image from "next/image";

/**
 * Brand logo mapping for the curated catalog. Files live in /public.
 * Monochrome currentColor marks (Z.ai, xAI/Grok) are inlined below so
 * they inherit the text color and stay visible in both themes.
 */
const BRAND_ICONS: Record<string, string | null> = {
  Anthropic: "/anthropic.svg",
  OpenAI: "/chatgpt.svg",
  Google: "/gemini.svg",
  DeepSeek: "/deepseek.svg",
  Moonshot: "/moonshot.svg",
  MiniMax: "/minimax.svg",
};

/** Solid-dark wordmark, inverted on the dark canvas. */
const DARK_INVERT = new Set(["Anthropic"]);

/** Inline currentColor icons keyed by brand. */
const INLINE_ICONS: Record<string, React.ReactNode> = {
  "Z.ai": (
    <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.105 2L9.927 4.953H.653L2.83 2h9.276zM23.254 19.048L21.078 22h-9.242l2.174-2.952h9.244zM24 2L9.264 22H0L14.736 2H24z" />
    </svg>
  ),
  xAI: (
    <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-3.546-4.132-6.37-8.096-6.37-4.382 0-7.556 3.117-7.556 6.867 0 .563.057 1.063.162 1.537L0 19.36V2h17.46L9.27 15.29z" />
    </svg>
  ),
};

export function BrandLogo({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const inline = INLINE_ICONS[brand];
  if (inline) {
    return (
      <span
        role="img"
        aria-label={`${brand} logo`}
        className={`inline-flex h-6 w-6 items-center justify-center text-text-primary [&_svg]:h-full [&_svg]:w-full ${className ?? ""}`}
      >
        {inline}
      </span>
    );
  }

  const src = BRAND_ICONS[brand];
  if (src) {
    return (
      <Image
        src={src}
        alt={`${brand} logo`}
        width={24}
        height={24}
        className={`h-6 w-6 object-contain ${DARK_INVERT.has(brand) ? "dark:invert" : ""} ${className ?? ""}`}
      />
    );
  }

  // Unknown brand: neutral monogram badge
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 items-center justify-center rounded-md border border-border-subtle bg-surface-2 font-mono text-[10px] font-bold text-text-secondary ${className ?? ""}`}
    >
      {brand.slice(0, 1)}
    </span>
  );
}
