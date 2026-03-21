import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { resumeSection } from "./cv-schema";

export const sectionComment = pgTable(
  "section_comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectionId: text("section_id")
      .notNull()
      .references(() => resumeSection.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sectionComment_sectionId_idx").on(table.sectionId),
    index("sectionComment_userId_idx").on(table.userId),
  ],
);

export const sectionCommentRelations = relations(
  sectionComment,
  ({ one }) => ({
    section: one(resumeSection, {
      fields: [sectionComment.sectionId],
      references: [resumeSection.id],
    }),
    user: one(user, {
      fields: [sectionComment.userId],
      references: [user.id],
    }),
  }),
);
