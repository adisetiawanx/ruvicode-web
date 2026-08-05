import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * Ruvicode brand logo — Clay square with "R" monogram.
 * Pure inline SVG, no network request. 28×28 by default.
 */
export function Logo({ className, showWordmark = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="8" fill="var(--accent)" />
        <path
          d="M9 8L9 20M9 8L17 8C19.5 8 20 9.5 20 11C20 12.5 19.5 14 17 14L9 14"
          stroke="var(--text-inverse)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark && (
        <span className="text-lg font-semibold">Ruvicode</span>
      )}
    </div>
  );
}
