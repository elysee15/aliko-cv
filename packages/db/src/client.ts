import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import { env } from "./env";

const connectionString = env.POSTGRES_URL ?? env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL in the environment.");
}

const isDevelopment = env.NODE_ENV !== "production";

const pool = new Pool({
  connectionString,
  max: isDevelopment ? 8 : 20,
  idleTimeoutMillis: isDevelopment ? 5000 : 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});

export const db = drizzle({
  client: pool,
  schema,
  casing: "snake_case",
});

export type Database = typeof db;

export type TransactionClient = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type DatabaseOrTransaction = Database | TransactionClient;

/** Call on graceful shutdown (e.g. scripts), not required per-request in Next.js. */
export async function closeDb(): Promise<void> {
  await pool.end();
}
