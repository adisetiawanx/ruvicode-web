import { getAdminDeposits, getAdminRevenue } from "./admin";
import { getAdminChainData } from "./admin";
export async function getAdminFinancial() {
  const [revenue, deposits, chain] = await Promise.all([getAdminRevenue(), getAdminDeposits(), getAdminChainData()]);
  return { revenue, deposits, chain };
}
