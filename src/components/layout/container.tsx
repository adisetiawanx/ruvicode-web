import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "content" | "prose";
}

const sizeMap = {
  default: "max-w-[1280px]", // Standard pages
  wide: "max-w-[1440px]", // Landing (extra breathing room)
  content: "max-w-[1024px]", // Content-focused pages
  prose: "max-w-[680px]", // Blog, docs text
};

/**
 * Shared page-content wrapper. Handles max-width + horizontal padding.
 *
 * - `size="wide"` (1440px) — landing, marketing
 * - `size="default"` (1280px) — standard pages, dashboard
 * - `size="content"` (1024px) — content-focused pages
 * - `size="prose"` (680px) — blog articles, docs text
 */
export function Container({
  size = "default",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-6 md:px-8", sizeMap[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
