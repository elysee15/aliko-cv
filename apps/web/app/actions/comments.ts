"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  getCommentsBySection,
  createComment,
  updateComment,
  deleteComment,
} from "@aliko-cv/db/queries";
import { auth } from "@/lib/auth";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

export async function getCommentsAction(
  sectionId: string,
): Promise<
  ActionResult<
    { id: string; content: string; createdAt: Date; updatedAt: Date }[]
  >
> {
  try {
    const user = await requireUser();
    const comments = await getCommentsBySection(db, sectionId, user.id);
    return { success: true, data: comments };
  } catch {
    return { success: false, error: "Impossible de charger les commentaires." };
  }
}

export async function createCommentAction(input: {
  sectionId: string;
  resumeId: string;
  content: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const content = input.content?.trim();
    if (!content) return { success: false, error: "Le commentaire est vide." };

    const comment = await createComment(db, {
      sectionId: input.sectionId,
      userId: user.id,
      content,
    });

    revalidatePath(`/dashboard/${input.resumeId}`);
    return { success: true, data: { id: comment.id } };
  } catch {
    return { success: false, error: "Impossible de créer le commentaire." };
  }
}

export async function updateCommentAction(input: {
  id: string;
  resumeId: string;
  content: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const content = input.content?.trim();
    if (!content) return { success: false, error: "Le commentaire est vide." };

    const comment = await updateComment(db, input.id, user.id, content);
    if (!comment) return { success: false, error: "Commentaire introuvable." };

    revalidatePath(`/dashboard/${input.resumeId}`);
    return { success: true, data: { id: comment.id } };
  } catch {
    return { success: false, error: "Impossible de modifier le commentaire." };
  }
}

export async function deleteCommentAction(input: {
  id: string;
  resumeId: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const comment = await deleteComment(db, input.id, user.id);
    if (!comment) return { success: false, error: "Commentaire introuvable." };

    revalidatePath(`/dashboard/${input.resumeId}`);
    return { success: true, data: { id: comment.id } };
  } catch {
    return { success: false, error: "Impossible de supprimer le commentaire." };
  }
}
