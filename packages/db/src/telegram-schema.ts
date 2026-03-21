import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const telegramLink = pgTable(
  "telegram_link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    chatId: bigint("chat_id", { mode: "number" }).notNull().unique(),
    username: text("username"),
    linkedAt: timestamp("linked_at").defaultNow().notNull(),
  },
  (table) => [
    index("telegramLink_userId_idx").on(table.userId),
    index("telegramLink_chatId_idx").on(table.chatId),
  ],
);

/** Pending link tokens — short-lived, one-time use */
export const telegramLinkToken = pgTable(
  "telegram_link_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("telegramLinkToken_token_idx").on(table.token)],
);

export const telegramLinkRelations = relations(telegramLink, ({ one }) => ({
  user: one(user, { fields: [telegramLink.userId], references: [user.id] }),
}));
