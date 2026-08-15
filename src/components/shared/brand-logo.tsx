import Image from "next/image";

/**
 * Brand marks for the curated catalog, rendered on a chip background so
 * every logo is legible on both themes: light chips carry the dark and
 * monochrome marks (OpenAI, Z.ai, xAI, Anthropic), dark chips carry the
 * white marks (Moonshot), and colorful marks sit on a neutral surface.
 */

type ChipStyle = "light" | "dark" | "neutral";

const BRANDS: Record<string, { src?: string; inline?: React.ReactNode; chip: ChipStyle }> = {
  Anthropic: { src: "/anthropic.svg", chip: "light" },
  OpenAI: { src: "/chatgpt.svg", chip: "neutral" },
  Google: { src: "/gemini.svg", chip: "neutral" },
  DeepSeek: { src: "/deepseek.svg", chip: "neutral" },
  MiniMax: { src: "/minimax.svg", chip: "neutral" },
  Moonshot: { src: "/moonshot.svg", chip: "dark" },
  // Monochrome currentColor marks, inlined to inherit chip color.
  "Z.ai": {
    chip: "light",
    inline: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.105 2L9.927 4.953H.653L2.83 2h9.276zM23.254 19.048L21.078 22h-9.242l2.174-2.952h9.244zM24 2L9.264 22H0L14.736 2H24z" />
      </svg>
    ),
  },
  xAI: {
    chip: "light",
    inline: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-3.546-4.132-6.37-8.096-6.37-4.382 0-7.556 3.117-7.556 6.867 0 .563.057 1.063.162 1.537L0 19.36V2h17.46L9.27 15.29z" />
      </svg>
    ),
  },
};

const CHIP_CLASS: Record<ChipStyle, string> = {
  // Light chip: white background, dark icon.
  light: "bg-white text-[#181818]",
  // Dark chip: elevated dark background, white/colored icon.
  dark: "bg-[#1f2937] border border-white/10",
  // Neutral: subtle surface that works under colorful marks.
  neutral: "bg-white",
};

export function BrandLogo({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const b = BRANDS[brand];

  if (!b) {
    return (
      <span
        aria-hidden
        className={`flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-surface-2 font-mono text-[10px] font-bold text-text-secondary ${className ?? ""}`}
      >
        {brand.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${brand} logo`}
      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md ${CHIP_CLASS[b.chip]} ${className ?? ""}`}
    >
      {b.inline ? (
        <span className="h-[18px] w-[18px] [&_svg]:h-full [&_svg]:w-full">
          {b.inline}
        </span>
      ) : (
        <Image
          src={b.src!}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      )}
    </span>
  );
}
