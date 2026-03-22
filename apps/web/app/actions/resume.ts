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

    if (resume) {
      const event =
        data.status === "published" ? "resume.published" : "resume.updated";
      dispatchWebhook(ctx.user.id, event, {
        resumeId: id,
        ...(data.title && { title: data.title }),
        ...(data.status && { status: data.status }),
      });
    }

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
  .action(async ({ parsedInput, ctx }) => {
    const ok = await reorderSections(
      db,
      ctx.user.id,
      parsedInput.resumeId,
      parsedInput.items,
    );
    if (!ok) throw new ActionError("CV introuvable.");
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
  .action(async ({ parsedInput, ctx }) => {
    const ok = await reorderEntries(
      db,
      ctx.user.id,
      parsedInput.resumeId,
      parsedInput.items,
    );
    if (!ok) throw new ActionError("CV introuvable.");
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return null;
  });

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export const createSectionAction = authClient
  .inputSchema(createSectionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const section = await createSection(db, ctx.user.id, parsedInput);
    if (!section) throw new ActionError("CV introuvable.");
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
  .action(async ({ parsedInput, ctx }) => {
    const { id, resumeId, ...data } = parsedInput;
    const section = await updateSection(db, ctx.user.id, { id, ...data });
    if (!section) throw new ActionError("Section introuvable.");
    revalidatePath(`/dashboard/${resumeId}`);
    return section;
  });

export const deleteSectionAction = authClient
  .inputSchema(
    z.object({ id: z.string().min(1), resumeId: z.string().min(1) }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const section = await deleteSection(db, parsedInput.id, ctx.user.id);
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
  .action(async ({ parsedInput, ctx }) => {
    const { resumeId, ...data } = parsedInput;
    const entry = await createEntry(db, ctx.user.id, data);
    if (!entry) throw new ActionError("Section introuvable.");
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
  .action(async ({ parsedInput, ctx }) => {
    const { id, resumeId, ...data } = parsedInput;
    const entry = await updateEntry(db, ctx.user.id, { id, ...data });
    if (!entry) throw new ActionError("Entrée introuvable.");
    revalidatePath(`/dashboard/${resumeId}`);
    return entry;
  });

export const deleteEntryAction = authClient
  .inputSchema(
    z.object({ id: z.string().min(1), resumeId: z.string().min(1) }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const entry = await deleteEntry(db, parsedInput.id, ctx.user.id);
    if (!entry) throw new ActionError("Entrée introuvable.");
    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return entry;
  });
