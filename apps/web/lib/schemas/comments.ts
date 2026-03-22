import { z } from "zod";

export const getCommentsSchema = z.object({
  sectionId: z.string().min(1),
});

export type GetCommentsInput = z.infer<typeof getCommentsSchema>;

export const createCommentSchema = z.object({
  sectionId: z.string().min(1),
  resumeId: z.string().min(1),
  content: z.string().min(1, "Le commentaire est vide.").max(5000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  id: z.string().min(1),
  resumeId: z.string().min(1),
  content: z.string().min(1, "Le commentaire est vide.").max(5000),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export const deleteCommentSchema = z.object({
  id: z.string().min(1),
  resumeId: z.string().min(1),
});

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
