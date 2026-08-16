import { getAdminAuditLog } from "./admin";
export async function listAdminAudit(filters: { limit?: number } = {}) { return getAdminAuditLog(Math.min(100, Math.max(1, filters.limit ?? 50))); }
export function redactAdminDetails(value: unknown): unknown { if (Array.isArray(value)) return value.map(redactAdminDetails); if (!value || typeof value !== "object") return value; return Object.fromEntries(Object.entries(value).map(([key, val]) => /token|secret|password|mnemonic|private.?key|api.?key/i.test(key) ? [key, "[redacted]"] : [key, redactAdminDetails(val)])); }
