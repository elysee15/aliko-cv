"use server";

import { z } from "zod";
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

import { authClient, ActionError } from "@/lib/safe-action";
import { dispatchWebhook } from "@/lib/webhooks";
import {
  createResumeSchema,
  updateResumeSchema,
  createSectionSchema,
  updateSectionSchema,
  createEntrySchema,
  updateEntrySchema,
} from "@/lib/schemas/resume";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ---------------------------------------------------------------------------
// Resume
// ---------------------------------------------------------------------------

export const createResumeAction = authClient
  .inputSchema(createResumeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const slug = `${slugify(parsedInput.title)}-${Date.now().toString(36)}`;

    const resume = await createResume(db, {
      userId: ctx.user.id,
      title: parsedInput.title,
      slug,
    });

    if (resume) {
      dispatchWebhook(ctx.user.id, "resume.created", {
        resumeId: resume.id,
        title: resume.title,
      });
    }

    revalidatePath("/dashboard");
    return resume;
  });

export const updateResumeAction = authClient
  .inputSchema(
    z.object({ id: z.string().min(1), ...updateResumeSchema.shape }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...data } = parsedInput;

    const resume = await updateResume(db, {
      id,
      userId: ctx.user.id,
      ...data,
    });

    const event =
      data.status === "published" ? "resume.published" : "resume.updated";
    dispatchWebhook(ctx.user.id, event, {
      resumeId: id,
      ...(data.title && { title: data.title }),
      ...(data.status && { status: data.status }),
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${id}`);
    return resume;
  });

export const deleteResumeAction = authClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const resume = await deleteResume(db, parsedInput.id, ctx.user.id);
    if (!resume) throw new ActionError("CV introuvable.");

    dispatchWebhook(ctx.user.id, "resume.deleted", {
      resumeId: parsedInput.id,
    });

    revalidatePath("/dashboard");
    return resume;
  });

export const duplicateResumeAction = authClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const slug = `copie-${Date.now().toString(36)}`;
    const resume = await duplicateResume(
      db,
      parsedInput.id,
      ctx.user.id,
      slug,
    );
    if (!resume) throw new ActionError("CV introuvable.");

    revalidatePath("/dashboard");
    return resume;
  });

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

export const reorderSectionsAction = authClient
  .inputSchema(
    z.object({
      resumeId: z.string().min(1),
      items: z.array(
        z.object({ id: z.string().min(1), sortOrder: z.number().int() }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    await reorderSections(db, parsedInput.items);
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return null;
  });

export const reorderEntriesAction = authClient
  .inputSchema(
    z.object({
      resumeId: z.string().min(1),
      items: z.array(
        z.object({ id: z.string().min(1), sortOrder: z.number().int() }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    await reorderEntries(db, parsedInput.items);
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return null;
  });

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export const createSectionAction = authClient
  .inputSchema(createSectionSchema)
  .action(async ({ parsedInput }) => {
    const section = await createSection(db, parsedInput);
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return section;
  });

export const updateSectionAction = authClient
  .inputSchema(
    z.object({
      id: z.string().min(1),
      resumeId: z.string().min(1),
      ...updateSectionSchema.shape,
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, resumeId, ...data } = parsedInput;
    const section = await updateSection(db, { id, ...data });
    revalidatePath(`/dashboard/${resumeId}`);
    return section;
  });

export const deleteSectionAction = authClient
  .inputSchema(
    z.object({ id: z.string().min(1), resumeId: z.string().min(1) }),
  )
  .action(async ({ parsedInput }) => {
    const section = await deleteSection(db, parsedInput.id);
    if (!section) throw new ActionError("Section introuvable.");
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return section;
  });

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export const createEntryAction = authClient
  .inputSchema(
    z.object({ resumeId: z.string().min(1), ...createEntrySchema.shape }),
  )
  .action(async ({ parsedInput }) => {
    const { resumeId, ...data } = parsedInput;
    const entry = await createEntry(db, data);
    revalidatePath(`/dashboard/${resumeId}`);
    return entry;
  });

export const updateEntryAction = authClient
  .inputSchema(
    z.object({
      id: z.string().min(1),
      resumeId: z.string().min(1),
      ...updateEntrySchema.shape,
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, resumeId, ...data } = parsedInput;
    const entry = await updateEntry(db, { id, ...data });
    revalidatePath(`/dashboard/${resumeId}`);
    return entry;
  });

export const deleteEntryAction = authClient
  .inputSchema(
    z.object({ id: z.string().min(1), resumeId: z.string().min(1) }),
  )
  .action(async ({ parsedInput }) => {
    const entry = await deleteEntry(db, parsedInput.id);
    if (!entry) throw new ActionError("Entrée introuvable.");
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return entry;
  });
