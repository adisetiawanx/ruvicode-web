import { getAdminOps } from "./admin";
import { getAdminHealth, type AdminHealthItem } from "./admin-overview";

const emptyChain = { available: false, treasuryEth: 0, float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null as number | null, treasury: "", addresses: [] };

export async function getAdminTools(): Promise<{ ops: Awaited<ReturnType<typeof getAdminOps>>; health: AdminHealthItem[] }> {
  const health = await getAdminHealth(emptyChain);
  const ops = await getAdminOps();
  return { ops, health };
}
