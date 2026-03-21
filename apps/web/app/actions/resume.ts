"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createResume,
  deleteResume,
  updateResume,
  createSection,
  updateSection,
  deleteSection,
  createEntry,
  updateEntry,
  deleteEntry,
  duplicateResume,
  reorderSections,
  reorderEntries,
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";
import {
  createResumeSchema,
  updateResumeSchema,
  createSectionSchema,
  updateSectionSchema,
  createEntrySchema,
  updateEntrySchema,
} from "@/lib/schemas/resume";
import type {
  CreateSectionInput,
  UpdateSectionInput,
  CreateEntryInput,
  UpdateEntryInput,
} from "@/lib/schemas/resume";

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Non autorisé");
  return session.user;
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export async function createResumeAction(
  input: { title: string },
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = createResumeSchema.parse(input);
    const slug = `${slugify(parsed.title)}-${Date.now().toString(36)}`;

    const resume = await createResume(db, {
      userId: user.id,
      title: parsed.title,
      slug,
    });

    if (resume) {
      dispatchWebhook(user.id, "resume.created", {
        resumeId: resume.id,
        title: resume.title,
      });
    }

    revalidatePath("/dashboard");
    return { success: true, data: resume };
  } catch {
    return { success: false, error: "Impossible de créer le CV." };
  }
}

export async function updateResumeAction(
  id: string,
  input: {
    title?: string;
    slug?: string;
    summary?: string | null;
    phone?: string | null;
    website?: string | null;
    linkedin?: string | null;
    github?: string | null;
    status?: "draft" | "published";
    template?: "classic" | "modern" | "minimal";
  },
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const parsed = updateResumeSchema.parse(input);

    const resume = await updateResume(db, {
      id,
      userId: user.id,
      ...parsed,
    });

    const event =
      parsed.status === "published" ? "resume.published" : "resume.updated";
    dispatchWebhook(user.id, event, {
      resumeId: id,
      ...(parsed.title && { title: parsed.title }),
      ...(parsed.status && { status: parsed.status }),
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${id}`);
    return { success: true, data: resume };
  } catch {
    return { success: false, error: "Impossible de mettre à jour le CV." };
  }
}

export async function deleteResumeAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const resume = await deleteResume(db, id, user.id);
    if (!resume) return { success: false, error: "CV introuvable." };

    dispatchWebhook(user.id, "resume.deleted", { resumeId: id });

    revalidatePath("/dashboard");
    return { success: true, data: resume };
  } catch {
    return { success: false, error: "Impossible de supprimer le CV." };
  }
}

export async function duplicateResumeAction(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const slug = `copie-${Date.now().toString(36)}`;
    const resume = await duplicateResume(db, id, user.id, slug);
    if (!resume) return { success: false, error: "CV introuvable." };

    revalidatePath("/dashboard");
    return { success: true, data: resume };
  } catch {
    return { success: false, error: "Impossible de dupliquer le CV." };
  }
}

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

export async function reorderSectionsAction(
  resumeId: string,
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  try {
    await requireUser();
    await reorderSections(db, items);
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Impossible de réordonner les sections." };
  }
}

export async function reorderEntriesAction(
  resumeId: string,
  items: { id: string; sortOrder: number }[],
): Promise<ActionResult> {
  try {
    await requireUser();
    await reorderEntries(db, items);
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Impossible de réordonner les entrées." };
  }
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export async function createSectionAction(
  input: CreateSectionInput,
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = createSectionSchema.parse(input);
    const section = await createSection(db, parsed);
    revalidatePath(`/dashboard/${parsed.resumeId}`);
    return { success: true, data: section };
  } catch {
    return { success: false, error: "Impossible de créer la section." };
  }
}

export async function updateSectionAction(
  id: string,
  resumeId: string,
  input: UpdateSectionInput,
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = updateSectionSchema.parse(input);
    const section = await updateSection(db, { id, ...parsed });
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: section };
  } catch {
    return { success: false, error: "Impossible de modifier la section." };
  }
}

export async function deleteSectionAction(
  id: string,
  resumeId: string,
): Promise<ActionResult> {
  try {
    await requireUser();
    const section = await deleteSection(db, id);
    if (!section)
      return { success: false, error: "Section introuvable." };
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: section };
  } catch {
    return { success: false, error: "Impossible de supprimer la section." };
  }
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export async function createEntryAction(
  input: CreateEntryInput,
  resumeId: string,
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = createEntrySchema.parse(input);
    const entry = await createEntry(db, parsed);
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: entry };
  } catch {
    return { success: false, error: "Impossible de créer l'entrée." };
  }
}

export async function updateEntryAction(
  id: string,
  resumeId: string,
  input: UpdateEntryInput,
): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = updateEntrySchema.parse(input);
    const entry = await updateEntry(db, { id, ...parsed });
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: entry };
  } catch {
    return { success: false, error: "Impossible de modifier l'entrée." };
  }
}

export async function deleteEntryAction(
  id: string,
  resumeId: string,
): Promise<ActionResult> {
  try {
    await requireUser();
    const entry = await deleteEntry(db, id);
    if (!entry)
      return { success: false, error: "Entrée introuvable." };
    revalidatePath(`/dashboard/${resumeId}`);
    return { success: true, data: entry };
  } catch {
    return { success: false, error: "Impossible de supprimer l'entrée." };
  }
}
