import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * Ruvicode brand logo (public/ruvicode-logo.webp).
 * Renders at 28px height by default; wordmark optional.
 */
export function Logo({ className, showWordmark = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/ruvicode-logo.webp"
        alt="Ruvicode logo"
        width={28}
        height={28}
        priority
        className="h-7 w-7 rounded-md object-cover"
      />
      {showWordmark && (
        <span className="text-lg font-semibold">Ruvicode</span>
      )}
    </div>
  );
}
