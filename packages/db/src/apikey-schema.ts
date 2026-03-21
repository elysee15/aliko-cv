import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Stored as SHA-256 hash — the raw key is only shown once at creation */
    keyHash: text("key_hash").notNull().unique(),
    /** First 8 chars of the key for display ("ak_xxxxxxxx…") */
    keyPrefix: text("key_prefix").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("apiKey_userId_idx").on(table.userId),
    index("apiKey_keyHash_idx").on(table.keyHash),
  ],
);

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, { fields: [apiKey.userId], references: [user.id] }),
}));
