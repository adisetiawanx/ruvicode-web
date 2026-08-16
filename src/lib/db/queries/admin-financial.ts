import { getAdminDeposits, getAdminFloatVsLiability, getAdminRevenue } from "./admin";
export async function getAdminFinancial() {
  const rpcUrl = process.env.BASE_RPC_URL ?? "https://mainnet.base.org";
  const contract = process.env.USDC_CONTRACT ?? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const treasury = process.env.TREASURY_ADDRESS ?? "";
  const [revenue, deposits, chain] = await Promise.all([getAdminRevenue(), getAdminDeposits(), treasury ? getAdminFloatVsLiability(rpcUrl, contract, treasury) : Promise.resolve({ available: false, error: "Treasury is not configured", float: 0, treasuryUsdc: 0, liability: 0, held: 0, ratio: null, treasuryEth: 0, treasury: "", addresses: [] })]);
  return { revenue, deposits, chain };
}
