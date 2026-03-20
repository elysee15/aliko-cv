import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const resumeStatusEnum = pgEnum("resume_status", [
  "draft",
  "published",
]);

export const sectionTypeEnum = pgEnum("section_type", [
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "certifications",
  "volunteering",
  "interests",
  "custom",
]);

export const skillLevelEnum = pgEnum("skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

// ---------------------------------------------------------------------------
// Resume — the top-level CV entity
// ---------------------------------------------------------------------------

export const resume = pgTable(
  "resume",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    status: resumeStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("resume_userId_idx").on(table.userId),
    index("resume_slug_userId_idx").on(table.slug, table.userId),
  ],
);

// ---------------------------------------------------------------------------
// ResumeSection — ordered groups (Experience, Education, Skills…)
// ---------------------------------------------------------------------------

export const resumeSection = pgTable(
  "resume_section",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "cascade" }),
    type: sectionTypeEnum("type").notNull(),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    visible: boolean("visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("resumeSection_resumeId_idx").on(table.resumeId)],
);

// ---------------------------------------------------------------------------
// ResumeEntry — items within a section (a job, a degree, a project…)
// ---------------------------------------------------------------------------

export const resumeEntry = pgTable(
  "resume_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectionId: text("section_id")
      .notNull()
      .references(() => resumeSection.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    organization: text("organization"),
    location: text("location"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    current: boolean("current").default(false).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    visible: boolean("visible").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("resumeEntry_sectionId_idx").on(table.sectionId)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const resumeRelations = relations(resume, ({ one, many }) => ({
  user: one(user, { fields: [resume.userId], references: [user.id] }),
  sections: many(resumeSection),
}));

export const resumeSectionRelations = relations(
  resumeSection,
  ({ one, many }) => ({
    resume: one(resume, {
      fields: [resumeSection.resumeId],
      references: [resume.id],
    }),
    entries: many(resumeEntry),
  }),
);

export const resumeEntryRelations = relations(resumeEntry, ({ one }) => ({
  section: one(resumeSection, {
    fields: [resumeEntry.sectionId],
    references: [resumeSection.id],
  }),
}));
