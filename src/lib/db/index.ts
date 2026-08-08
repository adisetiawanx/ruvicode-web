/**
 * Database connection pool — Drizzle ORM + node-postgres.
 *
 * Used by Next.js Server Components, Server Actions, and API routes.
 * The Go gateway uses its own pgx pool against the same Postgres instance.
 *
 * If DATABASE_URL is not set (local dev without Docker), db is null and
 * query modules fall back to static seed data. This allows the build to
 * succeed and the dashboard to render without a running database.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Initialize the database pool if DATABASE_URL is configured.
 * Called lazily on first db access to avoid connecting at import time.
 */
function getDb() {
  if (!env.DATABASE_URL) return null;

  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10, // Max connections (PgBouncer handles distribution in prod)
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      void pool?.end();
    });
  }

  if (!dbInstance) {
    dbInstance = drizzle(pool, {
      schema,
      logger: process.env.NODE_ENV === "development",
    });
  }

  return dbInstance;
}

/**
 * The Drizzle ORM instance, or null if DATABASE_URL is not configured.
 * Query modules check `if (!db) return mockData` for local dev fallback.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error(
        "DATABASE_URL is not set — database queries are unavailable. Use static seed data for local dev.",
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (instance as any)[prop];
  },
});

/**
 * Check if the database is available (DATABASE_URL is set and pool connects).
 */
export const isDbAvailable = (): boolean => !!env.DATABASE_URL;

/**
 * Export the raw pool for scripts (seed, migrations) that need direct pg access.
 */
export { pool as _pool };
export { schema };
