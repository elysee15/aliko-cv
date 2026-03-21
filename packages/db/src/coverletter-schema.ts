import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { resume } from "./cv-schema";

export const coverLetter = pgTable(
  "cover_letter",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    resumeId: text("resume_id").references(() => resume.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    company: text("company"),
    jobTitle: text("job_title"),
    content: text("content").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("coverLetter_userId_idx").on(table.userId),
    index("coverLetter_resumeId_idx").on(table.resumeId),
  ],
);

export const coverLetterRelations = relations(coverLetter, ({ one }) => ({
  user: one(user, { fields: [coverLetter.userId], references: [user.id] }),
  resume: one(resume, {
    fields: [coverLetter.resumeId],
    references: [resume.id],
  }),
}));
