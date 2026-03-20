import { and, asc, desc, eq } from "drizzle-orm";

import type { Database } from "../client";
import { resume, resumeSection, resumeEntry } from "../cv-schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CreateResumeParams = {
  userId: string;
  title: string;
  slug: string;
  summary?: string;
};

export type UpdateResumeParams = {
  id: string;
  userId: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  status?: "draft" | "published";
};

export type CreateSectionParams = {
  resumeId: string;
  type:
    | "experience"
    | "education"
    | "skills"
    | "languages"
    | "projects"
    | "certifications"
    | "volunteering"
    | "interests"
    | "custom";
  title: string;
  sortOrder?: number;
};

export type UpdateSectionParams = {
  id: string;
  title?: string;
  sortOrder?: number;
  visible?: boolean;
};

export type CreateEntryParams = {
  sectionId: string;
  title: string;
  subtitle?: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  sortOrder?: number;
};

export type UpdateEntryParams = {
  id: string;
  title?: string;
  subtitle?: string | null;
  organization?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
  sortOrder?: number;
  visible?: boolean;
};

// ---------------------------------------------------------------------------
// Resume CRUD
// ---------------------------------------------------------------------------

export async function getResumesByUser(db: Database, userId: string) {
  return db.query.resume.findMany({
    where: eq(resume.userId, userId),
    orderBy: desc(resume.updatedAt),
  });
}

export async function getResumeById(
  db: Database,
  id: string,
  userId: string,
) {
  return db.query.resume.findFirst({
    where: and(eq(resume.id, id), eq(resume.userId, userId)),
    with: {
      sections: {
        orderBy: asc(resumeSection.sortOrder),
        with: {
          entries: {
            orderBy: asc(resumeEntry.sortOrder),
          },
        },
      },
    },
  });
}

export async function createResume(db: Database, params: CreateResumeParams) {
  const [row] = await db.insert(resume).values(params).returning();
  return row;
}

export async function updateResume(db: Database, params: UpdateResumeParams) {
  const { id, userId, ...data } = params;
  const [row] = await db
    .update(resume)
    .set(data)
    .where(and(eq(resume.id, id), eq(resume.userId, userId)))
    .returning();
  return row;
}

export async function deleteResume(
  db: Database,
  id: string,
  userId: string,
) {
  const [row] = await db
    .delete(resume)
    .where(and(eq(resume.id, id), eq(resume.userId, userId)))
    .returning();
  return row;
}

// ---------------------------------------------------------------------------
// Section CRUD
// ---------------------------------------------------------------------------

export async function createSection(
  db: Database,
  params: CreateSectionParams,
) {
  const [row] = await db.insert(resumeSection).values(params).returning();
  return row;
}

export async function updateSection(
  db: Database,
  params: UpdateSectionParams,
) {
  const { id, ...data } = params;
  const [row] = await db
    .update(resumeSection)
    .set(data)
    .where(eq(resumeSection.id, id))
    .returning();
  return row;
}

export async function deleteSection(db: Database, id: string) {
  const [row] = await db
    .delete(resumeSection)
    .where(eq(resumeSection.id, id))
    .returning();
  return row;
}

// ---------------------------------------------------------------------------
// Entry CRUD
// ---------------------------------------------------------------------------

export async function createEntry(db: Database, params: CreateEntryParams) {
  const [row] = await db.insert(resumeEntry).values(params).returning();
  return row;
}

export async function updateEntry(db: Database, params: UpdateEntryParams) {
  const { id, ...data } = params;
  const [row] = await db
    .update(resumeEntry)
    .set(data)
    .where(eq(resumeEntry.id, id))
    .returning();
  return row;
}

export async function deleteEntry(db: Database, id: string) {
  const [row] = await db
    .delete(resumeEntry)
    .where(eq(resumeEntry.id, id))
    .returning();
  return row;
}
