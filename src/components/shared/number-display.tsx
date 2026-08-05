import { cn } from "@/lib/utils";

interface NumberDisplayProps {
  value: number;
  format?: "currency" | "raw" | "tokens";
  decimals?: number;
  className?: string;
}

/**
 * Financial number display — always Geist Mono, tabular figures.
 * Numbers NEVER animate (no count-up). Per PAGES.md §5.4.
 */
export function NumberDisplay({
  value,
  format = "raw",
  decimals,
  className,
}: NumberDisplayProps) {
  const formatValue = () => {
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: decimals ?? 2,
          maximumFractionDigits: decimals ?? 2,
        }).format(value);
      case "tokens":
        return new Intl.NumberFormat("en-US").format(value);
      default:
        return value.toFixed(decimals ?? 2);
    }
  };

  return (
    <span className={cn("font-mono tabular", className)}>{formatValue()}</span>
  );
}
