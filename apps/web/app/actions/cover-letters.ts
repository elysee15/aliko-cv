"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import {
  createCoverLetterSchema,
  updateCoverLetterSchema,
  deleteCoverLetterSchema,
} from "@/lib/schemas/cover-letters";

export const createCoverLetterAction = authClient
  .inputSchema(createCoverLetterSchema)
  .action(async ({ parsedInput, ctx }) => {
    const letter = await createCoverLetter(db, {
      userId: ctx.user.id,
      title: parsedInput.title,
      resumeId: parsedInput.resumeId ?? null,
      company: parsedInput.company ?? null,
      jobTitle: parsedInput.jobTitle ?? null,
    });

    revalidatePath("/dashboard/cover-letters");
    return { id: letter.id };
  });

export const updateCoverLetterAction = authClient
  .inputSchema(updateCoverLetterSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...rest } = parsedInput;
    const letter = await updateCoverLetter(db, {
      id,
      userId: ctx.user.id,
      ...rest,
    });

    if (!letter) throw new ActionError("Lettre introuvable.");

    revalidatePath("/dashboard/cover-letters");
    revalidatePath(`/dashboard/cover-letters/${id}`);
    return { id: letter.id };
  });

export const deleteCoverLetterAction = authClient
  .inputSchema(deleteCoverLetterSchema)
  .action(async ({ parsedInput, ctx }) => {
    const letter = await deleteCoverLetter(db, parsedInput.id, ctx.user.id);
    if (!letter) throw new ActionError("Lettre introuvable.");

    revalidatePath("/dashboard/cover-letters");
    return { id: letter.id };
  });
