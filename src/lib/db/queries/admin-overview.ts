import { getAdminRevenue, getAdminUserStats, getAdminOps, getAdminFloatVsLiability } from "./admin";

export async function getAdminOverview() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const contract = process.env.USDC_CONTRACT ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const treasury = process.env.TREASURY_ADDRESS ?? "";
  const [users, revenue, ops, chain] = await Promise.all([
    getAdminUserStats(),
    getAdminRevenue(),
    getAdminOps(),
    treasury ? getAdminFloatVsLiability(rpcUrl, contract, treasury) : Promise.resolve({ available: false, error: "Treasury is not configured", ratio: null, treasuryEth: 0, float: 0, liability: 0, treasuryUsdc: 0, held: 0, treasury: "", addresses: [] }),
  ]);
  return { users, revenue, ops, chain };
}
