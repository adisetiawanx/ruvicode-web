import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Logo showWordmark />
      </Link>
      {children}
    </div>
  );
}
