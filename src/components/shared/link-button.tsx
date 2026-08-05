import type { ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof Button>;

interface LinkButtonProps extends Omit<ButtonProps, "render"> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Button that renders as a Next.js Link (<a> tag).
 *
 * Base UI's Button defaults to `nativeButton={true}`, which expects a real
 * <button>. When we render an <a> via the `render` prop, we must set
 * `nativeButton={false}` to avoid accessibility warnings and preserve
 * correct semantics for anchor-based navigation.
 */
export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={<Link href={href} />}
      {...props}
    >
      {children}
    </Button>
  );
}
