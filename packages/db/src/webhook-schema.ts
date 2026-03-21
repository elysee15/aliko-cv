import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const webhookEventEnum = pgEnum("webhook_event", [
  "resume.created",
  "resume.updated",
  "resume.deleted",
  "resume.published",
  "resume.exported",
]);

export const webhook = pgTable(
  "webhook",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    /** HMAC-SHA256 secret for signing payloads */
    secret: text("secret").notNull(),
    events: text("events").array().notNull(),
    active: boolean("active").default(true).notNull(),
    lastTriggeredAt: timestamp("last_triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("webhook_userId_idx").on(table.userId)],
);

export const webhookRelations = relations(webhook, ({ one }) => ({
  user: one(user, { fields: [webhook.userId], references: [user.id] }),
}));
