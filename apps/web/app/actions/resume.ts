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
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
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

export async function createResumeAction(input: { title: string }) {
  const user = await requireUser();
  const parsed = createResumeSchema.parse(input);

  const slug = `${slugify(parsed.title)}-${Date.now().toString(36)}`;

  const resume = await createResume(db, {
    userId: user.id,
    title: parsed.title,
    slug,
  });

  revalidatePath("/dashboard");
  return resume;
}

export async function updateResumeAction(
  id: string,
  input: { title?: string; summary?: string | null; status?: "draft" | "published" },
) {
  const user = await requireUser();
  const parsed = updateResumeSchema.parse(input);

  const resume = await updateResume(db, {
    id,
    userId: user.id,
    ...parsed,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
  return resume;
}

export async function deleteResumeAction(id: string) {
  const user = await requireUser();

  const resume = await deleteResume(db, id, user.id);
  if (!resume) throw new Error("CV introuvable");

  revalidatePath("/dashboard");
  return resume;
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export async function createSectionAction(input: CreateSectionInput) {
  await requireUser();
  const parsed = createSectionSchema.parse(input);
  const section = await createSection(db, parsed);
  revalidatePath(`/dashboard/${parsed.resumeId}`);
  return section;
}

export async function updateSectionAction(
  id: string,
  resumeId: string,
  input: UpdateSectionInput,
) {
  await requireUser();
  const parsed = updateSectionSchema.parse(input);
  const section = await updateSection(db, { id, ...parsed });
  revalidatePath(`/dashboard/${resumeId}`);
  return section;
}

export async function deleteSectionAction(id: string, resumeId: string) {
  await requireUser();
  const section = await deleteSection(db, id);
  if (!section) throw new Error("Section introuvable");
  revalidatePath(`/dashboard/${resumeId}`);
  return section;
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export async function createEntryAction(
  input: CreateEntryInput,
  resumeId: string,
) {
  await requireUser();
  const parsed = createEntrySchema.parse(input);
  const entry = await createEntry(db, parsed);
  revalidatePath(`/dashboard/${resumeId}`);
  return entry;
}

export async function updateEntryAction(
  id: string,
  resumeId: string,
  input: UpdateEntryInput,
) {
  await requireUser();
  const parsed = updateEntrySchema.parse(input);
  const entry = await updateEntry(db, { id, ...parsed });
  revalidatePath(`/dashboard/${resumeId}`);
  return entry;
}

export async function deleteEntryAction(id: string, resumeId: string) {
  await requireUser();
  const entry = await deleteEntry(db, id);
  if (!entry) throw new Error("Entrée introuvable");
  revalidatePath(`/dashboard/${resumeId}`);
  return entry;
}
