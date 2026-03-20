"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createResume,
  deleteResume,
  updateResume,
} from "@aliko-cv/db/queries";

import { auth } from "@/lib/auth";
import { createResumeSchema, updateResumeSchema } from "@/lib/schemas/resume";

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
  return resume;
}

export async function deleteResumeAction(id: string) {
  const user = await requireUser();

  const resume = await deleteResume(db, id, user.id);
  if (!resume) throw new Error("CV introuvable");

  revalidatePath("/dashboard");
  return resume;
}
