import type { Config } from "drizzle-kit";

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url },
  casing: "snake_case",
} satisfies Config;
