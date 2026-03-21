import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, date } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { resume } from "./cv-schema";
import { coverLetter } from "./coverletter-schema";

export const applicationStatusEnum = pgEnum("application_status", [
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
  "archived",
]);

export const jobApplication = pgTable(
  "job_application",
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
    coverLetterId: text("cover_letter_id").references(() => coverLetter.id, {
      onDelete: "set null",
    }),
    company: text("company").notNull(),
    jobTitle: text("job_title").notNull(),
    jobUrl: text("job_url"),
    status: applicationStatusEnum("status").default("wishlist").notNull(),
    appliedAt: date("applied_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("jobApplication_userId_idx").on(table.userId),
    index("jobApplication_status_idx").on(table.userId, table.status),
  ],
);

export const jobApplicationRelations = relations(
  jobApplication,
  ({ one }) => ({
    user: one(user, {
      fields: [jobApplication.userId],
      references: [user.id],
    }),
    resume: one(resume, {
      fields: [jobApplication.resumeId],
      references: [resume.id],
    }),
    coverLetter: one(coverLetter, {
      fields: [jobApplication.coverLetterId],
      references: [coverLetter.id],
    }),
  }),
);
