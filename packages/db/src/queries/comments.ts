import { and, asc, eq, inArray } from "drizzle-orm";

import type { Database } from "../client";
import { sectionComment } from "../comment-schema";

export async function getCommentsBySection(
  db: Database,
  sectionId: string,
  userId: string,
) {
  return db
    .select()
    .from(sectionComment)
    .where(
      and(
        eq(sectionComment.sectionId, sectionId),
        eq(sectionComment.userId, userId),
      ),
    )
    .orderBy(asc(sectionComment.createdAt));
}

export async function getCommentCountsBySections(
  db: Database,
  sectionIds: string[],
  userId: string,
) {
  if (sectionIds.length === 0) return {};

  const rows = await db
    .select({
      sectionId: sectionComment.sectionId,
      id: sectionComment.id,
    })
    .from(sectionComment)
    .where(
      and(
        inArray(sectionComment.sectionId, sectionIds),
        eq(sectionComment.userId, userId),
      ),
    );

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.sectionId] = (counts[row.sectionId] ?? 0) + 1;
  }
  return counts;
}

export async function createComment(
  db: Database,
  params: { sectionId: string; userId: string; content: string },
) {
  const rows = await db
    .insert(sectionComment)
    .values(params)
    .returning();
  return rows[0]!;
}

export async function updateComment(
  db: Database,
  id: string,
  userId: string,
  content: string,
) {
  const rows = await db
    .update(sectionComment)
    .set({ content })
    .where(and(eq(sectionComment.id, id), eq(sectionComment.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteComment(
  db: Database,
  id: string,
  userId: string,
) {
  const rows = await db
    .delete(sectionComment)
    .where(and(eq(sectionComment.id, id), eq(sectionComment.userId, userId)))
    .returning();
  return rows[0] ?? null;
}
