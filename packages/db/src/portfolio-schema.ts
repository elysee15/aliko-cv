import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const portfolioSettings = pgTable(
  "portfolio_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").default(false).notNull(),
    slug: text("slug").notNull().unique(),
    headline: text("headline"),
    bio: text("bio"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("portfolioSettings_userId_idx").on(table.userId),
    index("portfolioSettings_slug_idx").on(table.slug),
  ],
);

export const portfolioSettingsRelations = relations(
  portfolioSettings,
  ({ one }) => ({
    user: one(user, {
      fields: [portfolioSettings.userId],
      references: [user.id],
    }),
  }),
);
