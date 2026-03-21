import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../client";
import { coverLetter } from "../coverletter-schema";

export type CreateCoverLetterParams = {
  userId: string;
  title: string;
  resumeId?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  content?: string;
};

export type UpdateCoverLetterParams = {
  id: string;
  userId: string;
  title?: string;
  resumeId?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  content?: string;
};

export async function getCoverLettersByUser(db: Database, userId: string) {
  return db
    .select()
    .from(coverLetter)
    .where(eq(coverLetter.userId, userId))
    .orderBy(desc(coverLetter.updatedAt));
}

export async function getCoverLetterById(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .select()
    .from(coverLetter)
    .where(and(eq(coverLetter.id, id), eq(coverLetter.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createCoverLetter(
  db: Database,
  params: CreateCoverLetterParams,
) {
  const rows = await db
    .insert(coverLetter)
    .values({
      userId: params.userId,
      title: params.title,
      resumeId: params.resumeId ?? null,
      company: params.company ?? null,
      jobTitle: params.jobTitle ?? null,
      content: params.content ?? "",
    })
    .returning();
  return rows[0]!;
}

export async function updateCoverLetter(
  db: Database,
  params: UpdateCoverLetterParams,
) {
  const { id, userId, ...data } = params;
  const rows = await db
    .update(coverLetter)
    .set(data)
    .where(and(eq(coverLetter.id, id), eq(coverLetter.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteCoverLetter(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .delete(coverLetter)
    .where(and(eq(coverLetter.id, id), eq(coverLetter.userId, userId)))
    .returning();
  return rows[0] ?? null;
}
