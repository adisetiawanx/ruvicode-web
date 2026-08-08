"use server";

import { getSession } from "@/lib/session";
import {
  getAllUsageForExport,
  type UsageFilters,
} from "@/lib/db/queries/management";

/**
 * Generate CSV string from usage records matching current filters.
 * SECURITY: scoped to session.user.id.
 */
export async function exportUsageCsvAction(
  filters: Omit<UsageFilters, "page" | "pageSize">,
): Promise<{ ok: true; csv: string } | { ok: false; message: string }> {
  const session = await getSession();
  if (!session) return { ok: false, message: "Unauthorized" };

  const records = await getAllUsageForExport(session.user.id, filters);

  const header = "Date,Model,Prompt Tokens,Completion Tokens,Cost (USD)\n";
  const rows = records
    .map((r) => {
      const date = r.createdAt.toISOString();
      return `${date},${r.model},${r.promptTokens},${r.completionTokens},${r.cost}`;
    })
    .join("\n");

  return { ok: true, csv: header + rows };
}
