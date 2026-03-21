import { and, count, desc, eq, sql } from "drizzle-orm";

import type { Database } from "../client";
import { jobApplication } from "../application-schema";

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

export type CreateApplicationParams = {
  userId: string;
  company: string;
  jobTitle: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
};

export type UpdateApplicationParams = {
  id: string;
  userId: string;
  company?: string;
  jobTitle?: string;
  jobUrl?: string | null;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
};

export async function getApplicationsByUser(
  db: Database,
  userId: string,
  status?: ApplicationStatus,
) {
  const conditions = [eq(jobApplication.userId, userId)];
  if (status) {
    conditions.push(eq(jobApplication.status, status));
  }

  return db
    .select()
    .from(jobApplication)
    .where(and(...conditions))
    .orderBy(desc(jobApplication.updatedAt));
}

export async function getApplicationById(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .select()
    .from(jobApplication)
    .where(and(eq(jobApplication.id, id), eq(jobApplication.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getApplicationCountsByStatus(
  db: Database,
  userId: string,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      status: jobApplication.status,
      count: count(),
    })
    .from(jobApplication)
    .where(eq(jobApplication.userId, userId))
    .groupBy(jobApplication.status);

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}

export async function createApplication(
  db: Database,
  params: CreateApplicationParams,
) {
  const rows = await db
    .insert(jobApplication)
    .values({
      userId: params.userId,
      company: params.company,
      jobTitle: params.jobTitle,
      jobUrl: params.jobUrl ?? null,
      status: params.status ?? "wishlist",
      appliedAt: params.appliedAt ?? null,
      notes: params.notes ?? null,
      resumeId: params.resumeId ?? null,
      coverLetterId: params.coverLetterId ?? null,
    })
    .returning();
  return rows[0]!;
}

export async function updateApplication(
  db: Database,
  params: UpdateApplicationParams,
) {
  const { id, userId, ...data } = params;
  const rows = await db
    .update(jobApplication)
    .set(data)
    .where(and(eq(jobApplication.id, id), eq(jobApplication.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteApplication(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .delete(jobApplication)
    .where(and(eq(jobApplication.id, id), eq(jobApplication.userId, userId)))
    .returning();
  return rows[0] ?? null;
}
