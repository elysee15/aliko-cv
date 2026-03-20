import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL in the environment.");
}

const isDevelopment = process.env.NODE_ENV !== "production";

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

/** Call on graceful shutdown (e.g. scripts), not required per-request in Next.js. */
export async function closeDb(): Promise<void> {
  await pool.end();
}
