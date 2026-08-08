"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportUsageCsvAction } from "@/app/(dashboard)/dashboard/usage/actions";

interface UsageExportButtonProps {
  model?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function UsageExportButton({
  model,
  dateFrom,
  dateTo,
}: UsageExportButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportUsageCsvAction({
        model: model && model !== "all" ? model : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      // Download CSV
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ruvicode-usage-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Usage exported to CSV");
    });
  };

  // Suppress unused warning — router/searchParams available for future use
  void router;
  void searchParams;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}
