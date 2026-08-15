import Image from "next/image";

/**
 * Brand marks for the curated catalog, rendered on a chip background so
 * every logo is legible on both themes: light chips carry the dark and
 * monochrome marks (OpenAI, Z.ai, xAI, Anthropic), dark chips carry the
 * white marks (Moonshot), and colorful marks sit on a neutral surface.
 */

type ChipStyle = "light" | "neutral";

const BRANDS: Record<string, { src?: string; inline?: React.ReactNode; chip: ChipStyle }> = {
  Anthropic: { src: "/anthropic.svg", chip: "light" },
  OpenAI: { src: "/chatgpt.svg", chip: "neutral" },
  Google: { src: "/gemini.svg", chip: "neutral" },
  DeepSeek: { src: "/deepseek.svg", chip: "neutral" },
  MiniMax: { src: "/minimax.svg", chip: "neutral" },
  Moonshot: { src: "/moonshot.svg", chip: "light" },
  // Monochrome currentColor marks, inlined to inherit chip color.
  "Z.ai": {
    chip: "light",
    inline: (
      <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.105 2L9.927 4.953H.653L2.83 2h9.276zM23.254 19.048L21.078 22h-9.242l2.174-2.952h9.244zM24 2L9.264 22H0L14.736 2H24z" />
      </svg>
    ),
  },
  xAI: { src: "/grok.svg", chip: "light" },
};

const CHIP_CLASS: Record<ChipStyle, string> = {
  // Light chip: white background, dark icon.
  light: "bg-white text-[#181818]",
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
        className={`flex h-8 w-8 items-center justify-center rounded-md border border-border-subtle bg-surface-2 font-mono text-[11px] font-bold text-text-secondary ${className ?? ""}`}
      >
        {brand.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${brand} logo`}
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md ${CHIP_CLASS[b.chip]} ${className ?? ""}`}
    >
      {b.inline ? (
        <span className="h-5 w-5 [&_svg]:h-full [&_svg]:w-full">
          {b.inline}
        </span>
      ) : (
        <Image
          src={b.src!}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
      )}
    </span>
  );
}
