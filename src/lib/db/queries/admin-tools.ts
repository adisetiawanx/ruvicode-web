import { getAdminChainData, getAdminOps } from "./admin";
import { getAdminHealth, type AdminHealthItem } from "./admin-overview";

export async function getAdminTools(): Promise<{ ops: Awaited<ReturnType<typeof getAdminOps>>; health: AdminHealthItem[] }> {
  const chainPromise = getAdminChainData();
  const [ops, health] = await Promise.all([
    getAdminOps(),
    chainPromise.then((resolved) => getAdminHealth(resolved)),
  ]);
  return { ops, health };
}
