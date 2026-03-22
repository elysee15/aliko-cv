"use server";

import { revalidatePath } from "next/cache";

import { db } from "@aliko-cv/db/client";
import {
  getCommentsBySection,
  createComment,
  updateComment,
  deleteComment,
} from "@aliko-cv/db/queries";

import { authClient, ActionError } from "@/lib/safe-action";
import {
  getCommentsSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from "@/lib/schemas/comments";

export const getCommentsAction = authClient
  .inputSchema(getCommentsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const comments = await getCommentsBySection(
      db,
      parsedInput.sectionId,
      ctx.user.id,
    );
    return comments;
  });

export const createCommentAction = authClient
  .inputSchema(createCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const comment = await createComment(db, {
      sectionId: parsedInput.sectionId,
      userId: ctx.user.id,
      content: parsedInput.content,
    });

    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return { id: comment.id };
  });

export const updateCommentAction = authClient
  .inputSchema(updateCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const comment = await updateComment(
      db,
      parsedInput.id,
      ctx.user.id,
      parsedInput.content,
    );
    if (!comment) throw new ActionError("Commentaire introuvable.");

    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return { id: comment.id };
  });

export const deleteCommentAction = authClient
  .inputSchema(deleteCommentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const comment = await deleteComment(db, parsedInput.id, ctx.user.id);
    if (!comment) throw new ActionError("Commentaire introuvable.");

    revalidatePath(`/dashboard/${parsedInput.resumeId}`);
    return { id: comment.id };
  });
