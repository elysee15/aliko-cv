"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
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

export async function createCoverLetterAction(input: {
  title: string;
  resumeId?: string | null;
  company?: string | null;
  jobTitle?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const title = input.title?.trim();
    if (!title) return { success: false, error: "Le titre est requis." };

    const letter = await createCoverLetter(db, {
      userId: user.id,
      title,
      resumeId: input.resumeId ?? null,
      company: input.company ?? null,
      jobTitle: input.jobTitle ?? null,
    });

    revalidatePath("/dashboard/cover-letters");
    return { success: true, data: { id: letter.id } };
  } catch {
    return { success: false, error: "Erreur lors de la création." };
  }
}

export async function updateCoverLetterAction(input: {
  id: string;
  title?: string;
  resumeId?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  content?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();

    const { id, ...rest } = input;
    const letter = await updateCoverLetter(db, {
      id,
      userId: user.id,
      ...rest,
    });

    if (!letter) return { success: false, error: "Lettre introuvable." };

    revalidatePath("/dashboard/cover-letters");
    revalidatePath(`/dashboard/cover-letters/${input.id}`);
    return { success: true, data: { id: letter.id } };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteCoverLetterAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser();
    const letter = await deleteCoverLetter(db, id, user.id);
    if (!letter) return { success: false, error: "Lettre introuvable." };

    revalidatePath("/dashboard/cover-letters");
    return { success: true, data: { id: letter.id } };
  } catch {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}
