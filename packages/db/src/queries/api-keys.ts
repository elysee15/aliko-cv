import { and, eq, isNull, desc } from "drizzle-orm";

import type { Database, DatabaseOrTransaction } from "../client";
import { apiKey } from "../apikey-schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateRawKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const base = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `ak_${base}`;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createApiKey(
  db: DatabaseOrTransaction,
  userId: string,
  name: string,
  scope: "read" | "read_write" = "read",
) {
  const rawKey = generateRawKey();
  const keyHash = await sha256(rawKey);
  const keyPrefix = rawKey.slice(0, 11);

  const [row] = await db
    .insert(apiKey)
    .values({ userId, name, keyHash, keyPrefix, scope })
    .returning({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scope: apiKey.scope,
      createdAt: apiKey.createdAt,
    });

  return { key: row!, rawKey };
}

export async function getApiKeysByUser(db: DatabaseOrTransaction, userId: string) {
  return db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scope: apiKey.scope,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(and(eq(apiKey.userId, userId), isNull(apiKey.revokedAt)))
    .orderBy(desc(apiKey.createdAt));
}

export async function revokeApiKey(
  db: Database,
  id: string,
  userId: string,
) {
  const [row] = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKey.id, id),
        eq(apiKey.userId, userId),
        isNull(apiKey.revokedAt),
      ),
    )
    .returning({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      revokedAt: apiKey.revokedAt,
    });
  return row;
}

/**
 * Validate an API key and return the associated user ID + scope.
 * Also updates `lastUsedAt`.
 */
export async function validateApiKey(
  db: Database,
  rawKey: string,
): Promise<{ userId: string; scope: "read" | "read_write" } | null> {
  const keyHash = await sha256(rawKey);
  const row = await db.query.apiKey.findFirst({
    where: and(eq(apiKey.keyHash, keyHash), isNull(apiKey.revokedAt)),
  });

  if (!row) return null;

  await db
    .update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKey.id, row.id));

  return { userId: row.userId, scope: row.scope };
}
