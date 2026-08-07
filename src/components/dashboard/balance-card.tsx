import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance: string;
  held: string;
}

/**
 * Dashboard balance card — shows available balance (balance - held).
 * Numbers ALWAYS use mono tabular figures (PAGES.md §3.3).
 * Numbers NEVER animate (PAGES.md §5.4).
 */
export function BalanceCard({ balance, held }: BalanceCardProps) {
  const available = (Number(balance) - Number(held)).toFixed(2);
  const hasPending = Number(held) > 0;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border p-6",
        "border-accent/30 bg-accent-subtle",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-accent" />
        <p className="text-xs text-text-secondary">Available Balance</p>
      </div>
      <p className="mb-1 font-mono text-3xl tabular text-text-primary">
        ${available}
      </p>
      {hasPending && (
        <p className="font-mono text-xs tabular text-text-muted">
          (${Number(held).toFixed(2)} in pending requests)
        </p>
      )}
      <Link
        href="/dashboard/topup"
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-hover active:bg-accent-pressed"
      >
        Top Up
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
